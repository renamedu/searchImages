<Group>
    <Search
    value={searchValue}
    onChange={handleSearchChange}
    placeholder="Поиск по url"
    onFindButtonClick={onFindButtonClick}
    />
    {searchFieldSpinner && <Spinner size="regular"/>}
    {/* {searchFieldRes && 
    } */}
</Group>

const [searchValue, setSearchValue] = useState('');
  const [searchFieldRes, setSearchFieldRes] = useState(null);
  const [searchFieldSpinner, setSearchFieldSpinner] = useState(null);
  const [searchFieldEr, setSearchFieldEr] = useState(null);
  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };
  async function onFindButtonClick() {
    console.log("Search value:", searchValue);
    setSearchFieldSpinner(true);
    try {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imgUrl: searchValue,
        }),
      };
      const response = await fetch('http://localhost:3000/image-search', requestOptions);
      const searchImageResult = await response.json()
      setSearchFieldRes(searchImageResult.searchImageResult)
      setSearchFieldEr(null);
    } catch (error) {
      console.log(error)
      setSearchFieldEr(1);
    } finally {
      setSearchFieldSpinner(false);
    }
  };

  console.log(searchFieldRes)