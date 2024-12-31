import React, { useState, useRef } from 'react';
import { Box, TextField, Link } from '@radix-ui/themes';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import namesAndIds from './namesAndIds';

const SearchBox = () => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0); // Tracks highlighted dropdown item
    const inputRef = useRef(null);
    const listRef = useRef(null);

    // Filter subsystems based on query
    const filteredResults = namesAndIds.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
    );

    // Handle input change
    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        setIsOpen(value.trim() !== ''); // Open dropdown if there's a query
        setHighlightedIndex(0); // Reset highlight on new search
    };

    // Handle selection and redirection
    const handleSelect = (name, url) => {
        setQuery(name);
        setIsOpen(false); // Close dropdown
        setHighlightedIndex(0);
        window.location.href = url; // Redirect to URL
    };

    // Handle blur
    const handleBlur = (e) => {
        setTimeout(() => {
            if (
                inputRef.current &&
                !inputRef.current.contains(document.activeElement)
            ) {
                setIsOpen(false);
            }
        }, 200);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (!isOpen || filteredResults.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < filteredResults.length - 1 ? prev + 1 : 0
                );
                scrollIntoView();
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : filteredResults.length - 1
                );
                scrollIntoView();
                break;
            case 'Enter':
                e.preventDefault();
                const selectedItem = filteredResults[highlightedIndex];
                if (selectedItem) {
                    handleSelect(selectedItem.name, `/subsystem/${selectedItem.id}`);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
            default:
                break;
        }
    };

    // Scroll highlighted item into view
    const scrollIntoView = () => {
        if (listRef.current) {
            const activeItem = listRef.current.children[highlightedIndex];
            activeItem?.scrollIntoView({ block: 'nearest' });
        }
    };

    return (
        <Box maxWidth="300px" position="relative">
            {/* Search Input */}
            <TextField.Root
                ref={inputRef}
                placeholder="Find subsystems…"
                size="3"
                value={query}
                onChange={handleInputChange}
                onBlur={handleBlur}
                onFocus={() => setIsOpen(query.trim() !== '')}
                onKeyDown={handleKeyDown}
            >
                <TextField.Slot>
                    <MagnifyingGlassIcon height="16" width="16" />
                </TextField.Slot>
            </TextField.Root>

            {/* Dropdown */}
            {isOpen && (
                <Box
                    ref={listRef}
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        marginTop: '4px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        backgroundColor: 'var(--mauve-2)',
                        borderRadius: '4px',
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    {filteredResults.length > 0 ? (
                        filteredResults.map((item, index) => (
                            <Box
                                key={item.id}
                                onClick={() =>
                                    handleSelect(item.name, `/subsystem/${item.id}`)
                                }
                                style={{
                                    padding: '8px',
                                    cursor: 'pointer',
                                    backgroundColor:
                                        index === highlightedIndex
                                            ? 'var(--mauve-4)'
                                            : 'transparent',
                                    borderBottom: '1px solid #eee',
                                }}
                            >
                                <Link
                                    href={`/subsystem/${item.id}`}
                                    style={{
                                        textDecoration: 'none',
                                        color: 'inherit',
                                    }}
                                >
                                    {item.name}
                                </Link>
                            </Box>
                        ))
                    ) : (
                        <Box style={{ padding: '8px', color: '#888' }}>
                            No results found
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default SearchBox;
