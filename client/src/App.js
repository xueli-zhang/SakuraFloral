import React, { Component } from "react";

//Load css file
import "./assets/css/default.min.css";

//load Components
import Header from "./components/headerComponent/header";
import Footer from "./components/footerComponent/footer";
import Main from "./pages/sakura-main";
import Collections from "./pages/sakura-collections";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        <Main />
        <Collections />
        <Footer />
      </div>
    );
  }
}

export default App;
