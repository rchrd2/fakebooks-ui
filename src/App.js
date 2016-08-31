import React, { Component } from 'react';
import { Link } from 'react-router'

const realvocal_data = require("./data/fakebook_the-real-vocal-book.json");


/**
 * https://archive.org/download/fakebook_the-real-vocal-book/page/leaf0_w640.jpg
 */
function toImageUrl(id, leafNum) {
  return "https://archive.org/download/"+id+"/page/leaf"+leafNum+"_w1000.jpg"
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
    this.handleClose = this.handleClose.bind(this);

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
      searchValue: '' // reset search
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
    }
  }
  handleClose() {
    this.context.router.push('/');
  }
  renderToc() {
    var mappings, tocContents;
    if (this.state.searchValue.length > 0) {
      mappings = this.state.matches;
    } else {
      mappings = this.state.mappings;
    }
    if (mappings.length > 0) {
      var letters = {};
      mappings.forEach(function(row, idx) {
        var letter = row.title.charAt(0).toUpperCase();
        if (letters[letter] === undefined) {
          letters[letter] = [];
        }
        letters[letter].push(row);
      });

      tocContents = Object.keys(letters).sort().map(function(letter) {
        return (<div>
          <h1>{letter}</h1>
          {letters[letter].map(function(row) {
            return (<div className="toc-row">
              <Link to={row.identifier + '/' + row.title}>
                <span className="toc-title">{row.title}</span> <span className="toc-id">{row.identifier}</span>
              </Link>
            </div>)
          })}
        </div>);
      });
    } else {
      tocContents = (
        <div className="toc-no-results">No results found for <i>{this.state.searchValue}</i></div>
      );
    }

    return <div className="toc">
      {tocContents}
      <div className="toc-footer">
        See: <br/>
        <a href="https://archive.org/details/fakebooks">https://archive.org/details/fakebooks</a><br/>
        <a href="https://github.com/rchrd2/fakebooks-ui">https://github.com/rchrd2/fakebooks-ui</a>
      </div>
    </div>;
  }
  renderControls() {
    var controlEls;
    if (this.state.currIdx !== null) {
      var currSongTitle = this.state.mappings[this.state.currIdx].title;
      // closeEl = (<Link to={'/'}>[ X ]</Link>);
      controlEls = (<span>
        <button onClick={this.handlePrev}>Prev</button>
        {'  '}
        <button onClick={this.handleNext}>Next</button>
        {'  '}
        {currSongTitle}
        {'  '}
        <button onClick={this.handleClose}> X </button>
      </span>);
    }

    var controls = (
      <div className="Controls">
        <span>Fakebooks Browser</span>
        {'  '}
        {controlEls}
        <div className="search-wrapper">
          <input type="text" placeholder="Type in a song name" onChange={this.doSearch} value={this.state.searchValue} />
        </div>
      </div>
    );
    return controls;
  }
  render() {
    var controls = this.renderControls();

    var toc;
    if (this.state.currIdx === null || this.state.searchValue.length > 0) {
      toc = this.renderToc();
    }

    var currSongImages;
    if (toc === undefined && this.state.currIdx !== null) {
      var currSong = this.state.mappings[this.state.currIdx];
      currSongImages = (
        <div className={"images " + "pages" + String(currSong.leafNums.length)}>
          {currSong.leafNums.map((leafNum, idx) => {
            return <div
              style={{backgroundImage: 'url(' + toImageUrl(currSong.identifier, leafNum) + ')'}}
              className={"page"+idx}
              ></div>
          })}
        </div>
      );
    }

    return (
      <div className="App">
        {controls}
        {toc}
        {currSongImages}
      </div>
    );
  }
}

export default App;
