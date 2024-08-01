import * as React from 'react';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import namesAndIds from './namesAndIds.js';

export default function FreeSolo() {

  const handleOptionSelect = (event, value) => {
    if (value) {
      const selectedOption = namesAndIds.find((option) => option.name === value);
      if (selectedOption) {
        const id = selectedOption.id;
        window.location.href = `/subsystem/${id}`;
      }
    }
  };

  return (
    <Stack spacing={1} sx={{ width: 250 }}>
      <Autocomplete
        id="search-box"
        freeSolo
        options={namesAndIds.map((option) => option.name)}
        renderInput={(params) => (
          <TextField 
            {...params} 
            label="Search..." 
            sx={{ 
              '& .MuiInputBase-root': {
                padding: '0',
                backgroundColor: 'white',
              },
              '& .MuiFormLabel-root': {
                top: '-8px',
              },
              '& .Mui-focused': {
                top: 0,
              }
            }} 
          />
        )}
        onChange={handleOptionSelect}
      />
    </Stack>
  )
}
