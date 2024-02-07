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

function Select({states, onselect}){
  return (
  <select onChange={onselect}>
    {states.map(item => <option>{item}</option>)}
  </select>)
}

function Item({data, isError, isLoading, pageSize, handlePageChange, page}){
  if(isError){ 
    return <div> Something went wrong</div>;
  } else if(isLoading){
    return <div>Loading ...</div>;
  } else if(data.features.length == 0){
    return (<><h2>{data.title}</h2>
          <div>There are no alerts</div>
          </>)
  }else { return (
      <div>
      <ul>
        <h2>{data.title}</h2>
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

  const states = ['Alabama','Alaska','American Samoa','Arizona','Arkansas',
  'California','Colorado','Connecticut','Delaware','District of Columbia',
  'Federated States of Micronesia','Florida','Georgia','Guam','Hawaii','Idaho',
  'Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine',
  'Marshall Islands','Maryland','Massachusetts','Michigan','Minnesota',
  'Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota',
  'Northern Mariana Islands','Ohio','Oklahoma','Oregon','Palau','Pennsylvania',
  'Puerto Rico','Rhode Island','South Carolina','South Dakota','Tennessee',
  'Texas','Utah','Vermont','Virgin Island','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming'];

  const statesCode = ['AL', 'AK', 'AS', 'AZ', 'AR',
    'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA', 'GU', 'HI', 'ID', 
    'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 
    'MH', 'MD', 'MA', 'MI', 'MN', 
    'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 
    'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 
    'PR', 'RI', 'SC', 'SD', 'TN', 
    'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY'];

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



  const handlePageChange = e => {
    setCurrentPage(Number(e.target.textContent));
  };

 
  let page = [];
  if(!isLoading){
    page = data.features;

    if (page.length >= 1) {
      page = paginate(page, currentPage, pageSize);
      }
  }

  const selectChange = (e) => {
    let stateToUse = statesCode[e.target.selectedIndex];
    setQuery(stateToUse);
    doFetch(`https://api.weather.gov/alerts/active?area=${stateToUse}`);
    e.preventDefault();
  }


  return (
    <Fragment>
      <Select states = {states} onselect={selectChange}/>
      <Item isError={isError} isLoading={isLoading} data={data} 
      pageSize={pageSize} handlePageChange={handlePageChange} page={page}/>
    </Fragment>
  );
}

// ========================================
ReactDOM.render(<App />, document.getElementById("root"));
