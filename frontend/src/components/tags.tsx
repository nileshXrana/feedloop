import * as React from 'react';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';

export interface TagOption {
    inputValue?: string;
    title: string;
}

const filter = createFilterOptions<TagOption>();

export default function CreatableMultiAutocomplete({ value, setValue }: { value: TagOption[]; setValue: React.Dispatch<React.SetStateAction<TagOption[]>> }) {

    return (
        <Autocomplete
            sx={{ mt: 1 }}
            multiple
            id="creatable-multi-select"
            options={defaultTags}
            value={value}
            onChange={(event, newValue) => {
                const updatedValue = newValue.map((option) => {
                    if (typeof option === 'string') {
                        return { title: option };
                    }
                    if (option && option.inputValue) {
                        return { title: option.inputValue };
                    }
                    return option;
                });
                setValue(updatedValue);
            }}

            filterOptions={(options, params) => {
                const filtered = filter(options, params);

                const { inputValue } = params;

                const isExisting = options.some((option) => inputValue.toLowerCase() === option.title.toLowerCase());

                if (inputValue !== '' && !isExisting) {
                    filtered.push({
                        inputValue,
                        title: `Add "${inputValue}"`,
                    });
                }

                return filtered;
            }}

            getOptionLabel={(option) => {
                if (typeof option === 'string') {
                    return option;
                }
                if (option.inputValue) {
                    return option.inputValue;
                }
                return option.title;
            }}

            isOptionEqualToValue={(option, value) => option.title === value.title}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                    <li key={key} {...optionProps}>
                        {option.title}
                    </li>
                );
            }}
            renderValue={(tagValue, getItemProps) =>
                tagValue.map((option, index) => {
                    const { key, ...itemProps } = getItemProps({ index });
                    return <Chip key={key} label={option.title} {...itemProps} />;
                })
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="# Tags"
                    placeholder="Add tags"
                />
            )}
        />
    );
}

// Mock Data
const defaultTags: TagOption[] = [
    { title: 'UI' },
    { title: 'UX' },
    { title: 'Performance' },
    { title: 'Bug' },
    { title: 'Feature Request' },
    { title: 'Onboarding' },
    { title: 'Localization' },
    { title: 'Security' },
    { title: 'Integration' },
    { title: 'Billing' },
];
