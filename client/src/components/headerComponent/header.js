import React, { Component } from "react";
import logo from "../../staticImages/logo.png";
class Header extends Component {
  render() {
    return (
      <header>
        <img className="logo" src={logo} />
        <nav>
          <ul>
            <li>
              <a href="#">Sakura</a>
            </li>
            <li>
              <a href="#">Collections</a>
            </li>
            <li>
              <a href="#">Products</a>
            </li>
            <li>
              <a href="#">Trends</a>
            </li>
            <li>
              <a href="#">Diaries</a>
            </li>
          </ul>
        </nav>
      </header>
    );
  }
}

export default Header;
