import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CreatableMultiAutocomplete from './tags';
import BasicSelect from './select';
import { useAppDispatch } from '@/store';
import { saveFeedbackThunk } from '@/features/feedbacks/feedback.action';
import { feedbackFormData } from '@/features/feedbacks/feedback.type';

// interfaces
import { TagOption } from './tags';

export default function FormDialog() {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState<TagOption[]>([]);
    const [status, setStatus] = React.useState<'public' | 'private'>('public');

    const dispatch = useAppDispatch();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries((formData as any).entries());
        const feedbackTags = value.map((tag) => tag.title);
        const feedback: feedbackFormData = {
            title: formJson.title,
            description: formJson.description,
            tags: feedbackTags,
            status: status,
        }

        dispatch(saveFeedbackThunk(feedback));

        handleClose();
    };

    return (
        <React.Fragment>
            <Button variant="outlined" onClick={handleClickOpen} >
                Add Feedback
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Feedback Form</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter your valuable feedback here to help us improve our services. Your feedback is important to us !
                    </DialogContentText>
                    <form onSubmit={handleSubmit} id="subscription-form">
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            id="title"
                            name="title"
                            label="Feedback Title"
                            type="text"
                            fullWidth
                        // variant="standard"
                        />
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            id="description"
                            name="description"
                            label="Feedback Description"
                            type="text"
                            fullWidth
                            // variant="standard"
                            multiline
                            rows={4}
                        />
                        <CreatableMultiAutocomplete value={value} setValue={setValue} />
                        <BasicSelect status={status} setStatus={setStatus} />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit" form="subscription-form">
                        Submit Feedback
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
