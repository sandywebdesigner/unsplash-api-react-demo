import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import axios from 'axios';

var CONFIG = {
    __APP_ID__: '68ca0b8c027d613f05ce902a0412e2d22bb72822f42d9176c2125b3cc0e6bad9',
    BASE_URL: 'https://api.unsplash.com/search/photos'
  }

const { Component } = React;
const { render } = ReactDOM;

const LOAD_STATE = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  LOADING: 'LOADING'
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      photos: [],
      totalPhotos: 0,
      perPage: 5,
      currentPage: 1,
      tag: 'car',
      loadState: LOAD_STATE.LOADING
    }
  }
  
  componentDidMount() {
    this.fetchPhotos(this.state.currentPage, this.state.tag);
  }

  onPageChanged = (page) => {
    this.setState({currentPage: page})
    this.fetchPhotos(page, this.state.tag);
  }
  
  fetchPhotos = (page, tag) =>{
    var self = this;
    const { perPage } = this.state;
    const { appId, baseUrl } = this.props;
    const options = {
      params: {
        client_id: appId,
        page: page,
        per_page: perPage,
        query: tag
      }
    };
    
    this.setState({ loadState: LOAD_STATE.LOADING });
    axios.get(baseUrl, options)
      .then((response) => {
        self.setState({
          photos: response.data.results,
          totalPhotos: response.data.total,
          currentPage: page,
          loadState: LOAD_STATE.SUCCESS
        });
      })
      .catch(() => {
        this.setState({ loadState: LOAD_STATE.ERROR });
      });
  }

  onchange = (e) =>{
      this.setState({tag: e.target.value});

      if(this.debounce){
        clearTimeout(this.debounce)
      }

      this.debounce = setTimeout(()=>{
        this.fetchPhotos(this.state.currentPage, this.state.tag);
      }, 500);
  }
  
  render() {
    return (
      <div className="app">
        <div className={'search-div'}> 
        <div className="inputbar">
           <input placeholder='type your tag.' value={this.state.tag} onChange={this.onchange} />
         </div>
         </div>
         {this.state.loadState === LOAD_STATE.LOADING
            ? <div className="loader"></div>
            : <List data={this.state.photos} />  
          }

          <Pagination
          current={this.state.currentPage}
          total={this.state.totalPhotos} 
          perPage={this.state.perPage} 
          onPageChanged={this.onPageChanged}
          />
        
      </div>
    )
  }
}

const ListItem = ({ photo }) => {
  return (
    <div key={photo.id} className="grid__item card">
      <div className="card__body">
        <img src={photo.urls.small} alt="" />
      </div>
      <div className="card__footer media">
        <img src={photo.user.profile_image.small} alt="" className="media__obj" />
        <div className="media__body">
          <a href={photo.user.portfolio_url} target="_blank">{ photo.user.name }</a>
        </div>
      </div>
    </div>
  )
}

const List = ({ data }) => {
  var items = data.map(photo => <ListItem key={photo.id} photo={photo}/>);
  return (
    <div className="grid">
      { items }
    </div>
  )
}

class Pagination extends Component {  
  pages() {
    var pages = [];
    for(var i = this.rangeStart(); i <= this.rangeEnd(); i++) {
      pages.push(i)
    };
    return pages;
  }

  rangeStart() {
    var start = this.props.current - this.props.pageRange;
    return (start > 0) ? start : 1
  }

  rangeEnd() {
    var end = this.props.current + this.props.pageRange;
    var totalPages = this.totalPages();
    return (end < totalPages) ? end : totalPages;
  }

  totalPages() {
    return Math.ceil(this.props.total / this.props.perPage);
  }

  nextPage() {
    return this.props.current + 1;
  }

  prevPage() {
    return this.props.current - 1;
  }
  
  hasFirst() {
    return this.rangeStart() !== 1
  }

  hasLast() {
    return this.rangeEnd() < this.totalPages();
  }

  hasPrev() {
    return this.props.current > 1;
  }

  hasNext() {
    return this.props.current < this.totalPages();
  }

  changePage(page, tag) {
    this.props.onPageChanged(page, tag);
  }

  render() {
    return (
      <div className="pagination">
        <div className="pagination__left">
          <a href="#" className={!this.hasPrev() ? 'hidden': ''}
            onClick={e => this.changePage(this.prevPage())}
          >Prev</a>
        </div>

        <div className="pagination__mid">
          <ul>
            <li className={!this.hasFirst() ? 'hidden' : ''}>
              <a href="#" onClick={e => this.changePage(1)}>1</a>
            </li>
            <li className={!this.hasFirst() ? 'hidden' : ''}>...</li>
            {
              this.pages().map((page, index) => {
                return (
                  <li key={index}>
                    <a href="#"
                      onClick={e => this.changePage(page)}
                      className={ this.props.current == page ? 'current' : '' }
                    >{ page }</a>
                  </li>
                );
              })
            }
            <li className={!this.hasLast() ? 'hidden' : ''}>...</li>
            <li className={!this.hasLast() ? 'hidden' : ''}>
              <a href="#" onClick={e => this.changePage(this.totalPages())}>{ this.totalPages() }</a>
            </li>
          </ul>
        </div>

        <div className="pagination__right">
          <a href="#" className={!this.hasNext() ? 'hidden' : ''}
            onClick={e => this.changePage(this.nextPage())}
          >Next</a>
        </div>
      </div>
    );    
  }
};

Pagination.defaultProps = {
  pageRange: 2
}

render(
  <App
    appId={CONFIG.__APP_ID__}
    baseUrl={CONFIG.BASE_URL}
  />,
  document.getElementById('mount-point')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
