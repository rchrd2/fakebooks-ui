import React, { Component } from 'react';
import { Link } from 'react-router'

const realvocal_data = require("./data/fakebook_the-real-vocal-book.json");


/**
 * https://archive.org/download/fakebook_the-real-vocal-book/page/leaf0_w640.jpg
 */
function toImageUrl(id, leafNum) {
  return "https://archive.org/download/"+id+"/page/leaf"+leafNum+"_w640.jpg"
}

/**
 * http://stackoverflow.com/a/196991
 */
function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}


class App extends Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };
  constructor(props) {
    super(props);

    this.doSearch = this.doSearch.bind(this);
    this.loadSong = this.loadSong.bind(this);
    this.handlePrev = this.handlePrev.bind(this);
    this.handleNext = this.handleNext.bind(this);

    this.state = {
      isLoadingMappings: true,
      mappings: [],
      matches: [],
      searchValue: '',
      currIdx: 0,
    };

    // Update State from index data
    this.state = Object.assign(this.state, this.getStateFromData(realvocal_data));

    // Update State from route
    this.state = Object.assign(this.state, this.getStateFromProps(props));
  }

  getStateFromData(data) {
    data.forEach(function(row, idx) {
      row.title = toTitleCase(row.title);
    });
    return {
      mappings: this.state.mappings.concat(data).sort(function(a, b) {
        return a.title.toLowerCase() > b.title.toLowerCase();
      })
    };
  }

  getStateFromProps(props) {
    var idx = null;
    if (props.params.titleSlug) {
      // search for song by title
      var needle = props.params.titleSlug.toLowerCase();
      for (var i = 0; i < this.state.mappings.length; i++) {
        if (this.state.mappings[i].title.toLowerCase() === needle) {
          idx = i;
          break;
        }
      }
    }
    return {
      currIdx: idx,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.getStateFromProps(nextProps));
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
  /**
   * Changes URL and state
   */
  loadSong(row) {
    this.context.router.push(row.identifier + '/' + row.title);
    this.setState({
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
        currIdx = currIdx - 1;
      } else {
        currIdx = this.state.mappings.length - 1;
      }
      this.loadSong(this.state.mappings[currIdx]);
      // var currRow = this.state.mappings[currIdx];
      // this.context.router.push(currRow.identifier + '/' + currRow.title);
    }
  }
  handleNext() {
    var currIdx = this.state.currIdx;
    if (currIdx !== null) {
      if (currIdx < (this.state.mappings.length - 1)) {
        currIdx = currIdx + 1;
      } else {
        currIdx = 0;
      }
      this.loadSong(this.state.mappings[currIdx]);
      // var currRow = this.state.mappings[currIdx];
      // this.context.router.push(currRow.identifier + '/' + currRow.title);
    }
  }
  render() {
    var resultEls = this.state.matches.map((row, idx) => {
      return (
        <div className="result-row" key={idx} >
          <button onClick={() => {this.loadSong(row)}}>
            {row.identifier} – {row.title}
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
