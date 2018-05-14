import React, { Component } from "react";

//load social icon
import instagram from "../../staticImages/instagram.png";
import facebook from "../../staticImages/facebook.png";
import youtube from "../../staticImages/youtube.png";

class Footer extends Component {
  render() {
    return (
      <footer>
        <ul className="socialList">
          <li>
            <a src="#">
              <img src={instagram} title="instagram" />
            </a>
          </li>
          <li>
            <a src="#">
              <img src={facebook} title="facebook" />
            </a>
          </li>
          <li>
            <a src="#">
              <img src={youtube} title="youtube" />
            </a>
          </li>
        </ul>
        <span>©2018 by Sakura Floral Studio</span>
      </footer>
    );
  }
}

export default Footer;
