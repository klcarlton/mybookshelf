import React, { useState } from 'react';
import './App.css';
import './dnd-styles.css'
import GridLayout from 'react-grid-layout';
import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver';

interface SearchResult {
  title: string;
  cover_i: number;
};

interface Cover {
  SearchResult: SearchResult;
  url: string;
}

function SearchBox({ handleEnter }: { handleEnter: (searchTerm: string) => void }) {

  const [searchTerm, setSearchTerm] = useState("");

  function handleChange(event: { target: { value: React.SetStateAction<string>; }; }) {
    setSearchTerm(event.target.value);
  }

  function handleSearch() {
    handleEnter(searchTerm);
  }

  return (
    <div id='searchImage' className="coverSearchContainer">
      <div>
        <label>Title:
      <input type="text" size={50} value={searchTerm} onChange={handleChange}></input>
        </label>
      </div>
      <div>
        <button onClick={handleSearch}>Search</button>
      </div>
    </div>
  )
}

function CoverBox({ covers, addCoverToBookshelf }: { covers: Array<Cover>, addCoverToBookshelf: (c: Cover) => void }) {
  return (
    <div className="coverGridContainer">
      {covers.map(c => {
        return <Cover c={c} addCoverToBookshelf={addCoverToBookshelf} />
      })}
    </div >
  )
}

function Cover({ c, addCoverToBookshelf }: { c: Cover, addCoverToBookshelf: (c: Cover) => void }) {

  function handleDoubleClick() {
    addCoverToBookshelf(c);
  }

  return (
    <div className="cover" onDoubleClick={handleDoubleClick}>
      <p>{c.SearchResult.title}</p>
      <img src={c.url} width="150px" />
    </div>
  )
}

function BookShelf({ books }: { books: Array<Cover> }) {

  let x = -1;
  let y = 0;
  return (
    <div id='Bookshelf'>
      <GridLayout className="layout" cols={4} rowHeight={250} width={800} autoSize={true} isResizable={false}>
        {books.map(b => {
          x = (x + 1) % 4;
          if (x === 0) y++;
          return (
            <div className="book" key={`k_${x}${y}`} data-grid={{ x: x, y: y, w: 1, h: 1 }}>
              <img className="coverImg" src={b.url}/>
            </div>
          )
        })}

      </GridLayout>
      <p> Hello</p>
    </div>
  )
}

function App() {

  const [covers, setCovers] = useState<Array<Cover>>([]);
  const [bookshelf, setBookshelf] = useState<Array<Cover>>([]);

  let addCoverToBookshelf = (c: Cover) => {
    setBookshelf([...bookshelf, c])
  }

  let parseSearch = (data: any) => {

    var results = data.docs as Array<any>;
    var res = results
      .filter(x => x.cover_i)
      .map(x => {
        var r: SearchResult = {
          cover_i: x.cover_i,
          title: x.title,
        }
        return r;
      })

    return res.slice(0, Math.min(12, res.length));

  }

  let searchBrothers = (term: string) => {
    var searchString = term.replace(/ /g, '+');
    console.log(`searching: ${searchString}`)
    fetch(`http://openlibrary.org/search.json?q=${searchString}`)
      .then(res => res.json())
      .then(data => parseSearch(data))
      .then(results => {
        let covers = results.map(r => {
          var c: Cover = {
            SearchResult: r,
            url: `http://covers.openlibrary.org/b/id/${r.cover_i}-M.jpg`
          }
          return c;
        })
        console.log(covers);
        setCovers(covers);
      })
  }

  let saveImage = () => {
    domtoimage.toBlob(document.getElementById('Bookshelf') as HTMLElement)
      .then(function(blob) {
        saveAs(blob, 'my-node.png');
      });
  }

  return (
    <div className="layout">
      <div className="coverSearchGridContainer">
        <SearchBox handleEnter={searchBrothers} />
        <CoverBox covers={covers} addCoverToBookshelf={addCoverToBookshelf} />
      </div>
      <div>
        <button onClick={saveImage}>Save Bookshelf to Image</button>
        <BookShelf books={bookshelf} />
      </div>
    </div >
  );
}

export default App;
