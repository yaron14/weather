import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: [],
      daily: {},
      hourly: {},
      error: ""
    };
  }
  componentDidMount() {
    if (!this.props.city) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          this.fetchData({
            info: `lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          });
        },
        err => {
          this.setState({
            error: err.message
          });
        }
      );
    } else {
      const value = this.props.city;
      const city =
        value.split(", ").length <= 2
          ? value.split(", ")[0]
          : value
              .split(", ")[0]
              .split(" ")
              .join("&");
      const country = value.split(", ").length === 2 ? value.split(", ")[1] : value.split(", ")[2];
      this.fetchData({
        info: `city=${city}&country=${country ? country : ""}`
      });
    }
  }
  fetchData({ info } = {}) {
    Promise.all(
      [
        fetch(`https://api.weatherbit.io/v2.0/current?${info}&key=171524f097eb4182a7a0ed68dbe0f01f`).then(res =>
          res
            .json()
            .then(current =>
              this.setState({
                current: current.data
              })
            )
            .catch(err =>
              this.setState({
                error: err
              })
            )
        )
      ],
      [
        fetch(`https://api.weatherbit.io/v2.0/forecast/daily?${info}&days=5&key=171524f097eb4182a7a0ed68dbe0f01f`).then(res =>
          res
            .json()
            .then(daily =>
              this.setState({
                daily
              })
            )
            .catch(err => {
              this.setState({
                error: err
              });
            })
        )
      ],
      [
        fetch(`https://api.weatherbit.io/v2.0/forecast/3hourly?${info}&key=171524f097eb4182a7a0ed68dbe0f01f`).then(res =>
          res
            .json()
            .then(hourly =>
              this.setState({
                hourly
              })
            )
            .catch(err =>
              this.setState({
                error: err
              })
            )
        )
      ]
    ).catch(err => console.lop(err));
  }
  render() {
    if (this.state.current.status_code) {
      return <div>{this.state.current.status_message}</div>;
    }
    if (this.state.error) {
      console.log(this.state.error);
      return <div>{typeof this.state.error === "object" ? "ERROR!" : this.state.error}</div>;
    } else if (!Object.keys(this.state.daily).length || !this.state.current.length) {
      return <div>LOADING...</div>;
    }
    console.log(this.state);
    return (
      <div>
        {!this.props.city && <Link to="/search">Search for location</Link>}
        <h3>
          Weather forecast in {this.state.current[0].city_name}, {this.state.current[0].country_code}{" "}
        </h3>
        <div>
          <h4>Current Temp: {this.state.current[0].temp}C</h4>
        </div>
        <div className="day-display">
          {this.state.daily.data.map((data, i) => (
            <div key={i} style={{ paddingRight: "25px", paddingBottom: "20px" }}>
              <div className="img-container">
                <Link
                  to={{
                    pathname: `/hourly/${data.datetime}`,
                    state: this.state.hourly
                  }}
                >
                  <img src={`https://www.weatherbit.io/static/img/icons/${data.weather.icon}.png`} alt="_weather" className="image" />
                  <div className="overlay">
                    <div className="text">Hourly forecast</div>
                  </div>
                </Link>
              </div>
              <div className="weather-info">
                <span>
                  <strong>Weather on</strong> {data.datetime}:{" "}
                </span>
                <span className="hourly-weather">Average temp: {data.temp}C </span>
                <span className="hourly-weather">{data.weather.description} </span>
                <span>
                  <strong>Min Temp:</strong> {data.min_temp}C{" "}
                </span>
                <span>
                  <strong>Max Temp:</strong> {data.max_temp}C{" "}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
