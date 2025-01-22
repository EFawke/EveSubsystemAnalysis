import React from 'react';
import { Box, Select } from '@radix-ui/themes';
import namesAndIds from './namesAndIds';

const SearchBox = () => {
    const handleSelect = (value) => {
        window.location.href = `/subsystem/${value}`;
    };

    return (
        <Box id="searchbox">
        <Select.Root onValueChange={handleSelect}>
            <Select.Trigger placeholder="Find Subsystems..." />
            <Select.Content position="popper">
                <Select.Group>
                    {namesAndIds.map((item) => (
                        <Select.Item key={item.id} value={item.id}>
                            {item.name}
                        </Select.Item>
                    ))}
                </Select.Group>
            </Select.Content>
        </Select.Root>
        </Box>
    )
};

export default SearchBox;
