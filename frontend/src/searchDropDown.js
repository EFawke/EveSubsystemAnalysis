import React, { useState, useEffect } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import namesAndIds from './namesAndIds.js';

const SearchDropDown = ({ search }) => {
    const [filteredItems, setFilteredItems] = useState([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    useEffect(() => {
        if (search) {
            const filtered = namesAndIds.filter(item =>
                item.name.toLowerCase().includes(search.toLowerCase())
            );
            setFilteredItems(filtered);
            setHighlightedIndex(-1);
        } else {
            setFilteredItems([]);
        }
    }, [search]);

    // const handleKeyDown = (event) => {
    //     if (event.key === 'ArrowDown') {
    //         setHighlightedIndex(prevIndex => Math.min(prevIndex + 1, filteredItems.length - 1));
    //     } else if (event.key === 'ArrowUp') {
    //         setHighlightedIndex(prevIndex => Math.max(prevIndex - 1, 0));
    //     } else if (event.key === 'Enter' && highlightedIndex >= 0) {
    //         window.location.href = `/subsystem/${filteredItems[highlightedIndex].id}`;
    //     }
    // };

    return (
        <ListGroup className="position-absolute w-100" style={{ zIndex: 1000 }}
        //  onKeyDown={handleKeyDown}
        >
            {filteredItems.map((item, index) => (
                <a className = "dropdown-item" href = {`/subsystem/${item.id}`}>{item.name}</a>
                // console.log(item),
                // <ListGroup.Item
                //     key={item.id}
                //     action
                //     active={index === highlightedIndex}
                //     onClick={() => window.location.href = `/subsystem/${item.id}`}
                // >
                //     {item.name}
                // </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default SearchDropDown;
