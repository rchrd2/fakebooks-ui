import React, { Component } from 'react';

const realvocal_data = require("./data/fakebook_the-real-vocal-book.json");


/**
 * https://archive.org/download/fakebook_the-real-vocal-book/page/leaf0_w640.jpg
 */
function toImageUrl(id, leafNum) {
  return "https://archive.org/download/"+id+"/page/leaf"+leafNum+"_w640.jpg"
}


// function loadJson(url, complete, onerror) {
//   var request = new XMLHttpRequest();
//   request.open('GET', url, true);
//   request.onload = function() {
//     if (request.status >= 200 && request.status < 400) {
//       var data = JSON.parse(request.responseText);
//       complete(data);
//     } else { /* We reached our target server, but it returned an error */ }
//   };
//   request.onerror = function() {
//     onerror();
//   };
//   request.send();
// }


class App extends Component {
  constructor() {
    super();

    this.doSearch = this.doSearch.bind(this);
    this.loadSong = this.loadSong.bind(this);
    this.handlePrev = this.handlePrev.bind(this);
    this.handleNext = this.handleNext.bind(this);

    this.state = {
      isLoadingMappings: true,
      mappings: [],
      matches: [],
      searchValue: '',
      currIdx: null,
    };

    // Load mappings via ajax
    // loadJson("data/fakebook_the-real-vocal-book.json", (data) => {
    //   this.setState(this.getStateFromData(data));
    // });
    this.state = Object.assign(this.state, this.getStateFromData(realvocal_data));
  }
  getStateFromData(data) {
    return {
      mappings: this.state.mappings.concat(data).sort(function(a, b) {
        return a.title.toLowerCase() > b.title.toLowerCase();
      }),
      currIdx: 0,
    };
  }

  doSearch(e) {
    var term = e.target.value;
    var termLower = term.toLowerCase();
    this.setState({
      matches: this.state.mappings.filter(function(row, idx) {
        return row.title.toLowerCase().indexOf(termLower) >= 0;
      }),
      searchValue: term,
    })
  }
  loadSong(row) {
    this.setState({
      /* inefficient lookup :( */
      currIdx: this.state.mappings.indexOf(row),
      matches: [],
      searchValue: '',
    });
  }
  handlePrev() {
    var currIdx = this.state.currIdx;
    if (currIdx !== null) {
      if (currIdx > 0) {
        this.setState({currIdx: currIdx - 1});
      } else {
        this.setState({currIdx: this.state.mappings.length - 1});
      }
    }
  }
  handleNext() {
    var currIdx = this.state.currIdx;
    if (currIdx !== null) {
      if (currIdx < (this.state.mappings.length - 1)) {
        this.setState({currIdx: currIdx + 1});
      } else {
        this.setState({currIdx: 0});
      }
    }
  }
  render() {
    var resultEls = this.state.matches.map((row, idx) => {
      return (
        <div className="result-row" key={idx} >
          <button onClick={() => {this.loadSong(row)}}>
            {row.identifier} – {row.title}, {row.composer}
          </button>
        </div>
      );
    });
    var currSong, currSongImages, currSongTitle;
    if (this.state.currIdx !== null) {
      currSong = this.state.mappings[this.state.currIdx];
      currSongImages = currSong.leafNums.map((leafNum) => {
        return <div style={{backgroundImage: 'url(' + toImageUrl(currSong.identifier, leafNum) + ')'}}></div>
      });
      currSongTitle = currSong.title;
    }
    var controls = (
      <div className="Controls">
        <span>Fakebooks Browser</span>
        {'  '}
        <button onClick={this.handlePrev}>Prev</button>
        {'  '}
        <button onClick={this.handleNext}>Next</button>
        {'  '}
        {currSongTitle}

        <br/>
        <input type="text" placeholder="Type in a song name" onChange={this.doSearch} value={this.state.searchValue} />
        <div className="results" ref="results">
          {resultEls}
        </div>
      </div>
    );

    return (
      <div className="App">
        {controls}
        <div className="images">
          {currSongImages}
        </div>
      </div>
    );
  }
}

export default App;
