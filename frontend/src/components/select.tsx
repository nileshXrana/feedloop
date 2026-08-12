import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

export default function BasicSelect({ status, setStatus }: { status: 'public' | 'private'; setStatus: React.Dispatch<React.SetStateAction<'public' | 'private'>> }) {

    const handleChange = (event: SelectChangeEvent) => {
        setStatus(event.target.value as 'public' | 'private');
    };

    return (
        <Box sx={{ mt: 1.5 }}>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Status</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={status}
                    label="Status"
                    onChange={handleChange}
                >
                    <MenuItem value={'public'}>Public</MenuItem>
                    <MenuItem value={'private'}>Private</MenuItem>

                </Select>
            </FormControl>
        </Box>
    );
}
