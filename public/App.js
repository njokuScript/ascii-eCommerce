class App extends React.Component {
  constructor() {
    super();
    this.state = {
      page: 1,
      limit: 20,
      sort: "id",
      arr: [],
      idleArr: [],
      idlePage: 1,
      adsArr: [],
      lastPage: false,
      loading: true,
      idleLoading: false,
      loadingMore: false
    };
    this.handleScroll = this.handleScroll.bind(this);
    this.fetchMore = this.fetchMore.bind(this);
    this.changeSort = this.changeSort.bind(this);
    this.fetchNew = this.fetchNew.bind(this);
    this.idleLoad = this.idleLoad.bind(this);
    this.resetIdleTimer = this.resetIdleTimer.bind(this);
    this.new = 0;
  }

  componentDidMount() {
    const { page, limit, sort } = this.state;
    this.resetIdleTimer();
    document.addEventListener("mousemove", this.resetIdleTimer);
    document.addEventListener("keypress", this.resetIdleTimer);
    window.addEventListener("scroll", this.handleScroll);

    let newArr = [];
    for (let i = 0; i < 1000; ++i) {
      newArr[i] = i;
    }

    const newArrs = this.reArrange(newArr);
    const query = `/api/products?_page=${page}&_limit=${limit}&_sort=${sort}`;
    fetch(query)
      .then(function(response) {
        return response.json();
      })
      .then(
        function(myJson) {
          this.setState({ arr: myJson, loading: false, adsArr: newArrs });
        }.bind(this)
      );
  }
  //this function sets idle time to 60
  resetIdleTimer = () => {
    // idle time 60 secs
    clearTimeout(this.new);
    this.new = setTimeout(this.idleLoad(), 60000);
  };
  //this function is called when the browser is idle
  idleLoad = () => {
    const {
      page,
      sort,
      limit,
      arr,
      idleArr,
      idleLoading,
      loadingMore,
      loading
    } = this.state;
    //creates a new page
    const newPage = page + 1;
    if (!idleLoading && !loadingMore && !loading) {
      if (idleArr[idleArr.length - 1] === undefined) {
        this.setState({ idleLoading: true });
        const query = `/api/products?_page=${newPage}&_limit=${limit}&_sort=${sort}`;
        fetch(query)
          .then(function(response) {
            return response.json();
          })
          .then(
            function(arrObj) {
              this.setState({
                idleArr: arrObj,
                idlePage: newPage,
                idleLoading: false
              });
            }.bind(this)
          );
      }
    }
  };

  reArrange = array => {
    // rearrange the generated  ascending unique number to achieve random value in array
    let i = array.length,
      j = 0,
      temp;

    while (i--) {
      j = Math.floor(Math.random() * (i + 1));
      temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  };
  //creates a new date
  timeSince = dateNew => {
    const date = new Date(dateNew);
    const dateString =
      date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return dateString;
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return dateString;
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      if (interval > 7) {
        return dateString;
      }
      return interval + " days ago";
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval + " hours ago";
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
  };
  //handles scrolling
  handleScroll = event => {
    const { loadingMore, lastPage } = this.state;
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.body.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const currHeight = scrollTop + clientHeight;

    this.resetIdleTimer();

    if (currHeight >= scrollHeight) {
      if (!loadingMore && !lastPage) {
        this.fetchMore();
      }
    }
  };
  //fetches more products for new page
  fetchMore = () => {
    const { page, sort, limit, arr, idleArr, idlePage } = this.state;
    const newPage = page + 1;
    if (arr[arr.length - 1] !== undefined) {
      if (idleArr[idleArr.length - 1] !== undefined && idlePage === newPage) {
        this.setState({
          arr: [...arr, ...idleArr],
          page: newPage,
          idleArr: []
        });
      } else {
        this.setState({ loadingMore: true });
        const query = `/api/products?_page=${newPage}&_limit=${limit}&_sort=${sort}`;
        fetch(query)
          .then(function(response) {
            return response.json();
          })
          .then(
            function(arrObj) {
              if (arrObj[arrObj.length - 1] === undefined) {
                this.setState({
                  loadingMore: false,
                  page: newPage,
                  lastPage: true,
                  idleArr: []
                });
              } else {
                this.setState({
                  arr: [...arr, ...arrObj],
                  loadingMore: false,
                  page: newPage,
                  idleArr: [],
                  idlePage: newPage
                });
              }
            }.bind(this)
          );
      }
    }
    // To avoid loading more on initial loading
  };

  changeSort = evt => {
    this.setState(
      {
        sort: evt.target.value,
        loading: true,
        page: 1,
        idlePage: 1,
        idleArr: []
      },
      this.fetchNew
    );
  };

  fetchNew = () => {
    const { page, limit, sort } = this.state;

    let newArr = [];
    for (let i = 0; i < 1000; ++i) {
      newArr[i] = i;
    }
    const newArrs = this.reArrange(newArr);
    const query = `/api/products?_page=${page}&_limit=${limit}&_sort=${sort}`;
    window.addEventListener("scroll", this.handleScroll);
    fetch(query)
      .then(function(response) {
        return response.json();
      })
      .then(
        function(myJson) {
          this.setState({ arr: myJson, loading: false, adsArr: newArrs });
        }.bind(this)
      );
  };

  render() {
    return <div className="loader"></div>;
  }
}

ReactDOM.render(<App />, document.getElementById("products"));
