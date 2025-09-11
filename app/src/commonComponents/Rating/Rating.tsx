// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Rating as MuiRating, RatingProps, styled } from '@mui/material';
import React from 'react';

import { FormWrapper, FormProps } from '../FormWrapper/FormWrapper';

const Ratings = styled(MuiRating)(({ theme }) => ({
  '&.MuiRating-root': {
    display: 'flex',
    '& .MuiRating-icon, & .MuiRating-iconEmpty': {
      color: theme.palette.secondary.main,
    },
  },
}));

const Rating = React.forwardRef<HTMLInputElement, RatingProps & FormProps>(
  ({ label, error, helperText, id, ...props }, ref) => {
    return (
      <FormWrapper htmlFor={id} label={label} helperText={helperText} error={error} inline={true}>
        <Ratings {...props} id={id} ref={ref} />
      </FormWrapper>
    );
  }
);
Rating.displayName = 'Rating';

export default Rating;
