const Pagination = ({ items, pageSize, onPageChange }) => {
  const { Button } = ReactBootstrap;
  if (items.length <= 1) return null;

  let num = Math.ceil(items.length / pageSize);
  let pages = range(1, num);
  const list = pages.map(page => {
    return (
      <Button key={page} onClick={onPageChange} className="page-item">
        {page}
      </Button>
    );
  });
  return (
    <nav>
      <ul className="pagination">{list}</ul>
    </nav>
  );
};
const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};
function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}




const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  console.log("entered useDataApi");
  // this replaces the states: data, isLoading and isError with a dispatch function.  
  // the "action" object directs the dataFetchReducer function on how to service the events
  // based on these combined states
  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: true,
    isError: false,
    data: initialData
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      // dispatch builds the "action" and calls dataFetchReducer and passes in the current state and 
      // action varialbe 
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      console.log("fetching...");
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case "FETCH_SUCCESS":
      console.log("loaded...");
      console.log(action.payload)
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      };
    case "FETCH_FAILURE":
      console.log("fetch failure...");
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    default:
      throw new Error();
  }
};

function Item({data, isError, isLoading, title, pageSize, handlePageChange, page}){
  if(isError){ return <div> Something went wrong</div>;
  } else if(isLoading){return <div>Loading ...</div>;
  } else { return (
      <div>
      <ul>
        <h2>{title}</h2>
        {page.map(item => (
          <li key={item.id}>{item.properties.description}
          </li>
        ))}
      </ul>
      <Pagination
        items={data.features}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      ></Pagination>
      </div>
    )}
  }



function App() {

  console.log('Enter App');
  const { Fragment, useState, useEffect, useReducer } = React;

  const pageSize = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [mainTitle, setMainTitle] = useState("NWS Weather Alerts per State");
  const [query, setQuery] = useState("AL");
  console.log('set Query')
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "https://api.weather.gov/alerts/active?area=AL",
    {
      hits: []
    }
  );
  console.log('called useDataApi')


  const handlePageChange = e => {
    setCurrentPage(Number(e.target.textContent));
  };

  console.log('isLoading ' + isLoading);
  let page = [];
  if(!isLoading){
    page = data.features;

    if (page.length >= 1) {
      page = paginate(page, currentPage, pageSize);
      console.log(`currentPage: ${currentPage}`);
      }
  }

  console.log(page);

  return (
    <Fragment>
      
      <form
        onSubmit={event => {
          doFetch(`https://api.weather.gov/alerts/active?area=${query}`);
          event.preventDefault();
          setMainTitle(data.title);
        }}
      >
        <input
          type="text"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <Item isError={isError} isLoading={isLoading} data={data} title={data.title} 
      pageSize={pageSize} handlePageChange={handlePageChange} page={page}/>
{/*       <Pagination
        items={data.features}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      ></Pagination> */}


    </Fragment>
  );
}

// ========================================
ReactDOM.render(<App />, document.getElementById("root"));
