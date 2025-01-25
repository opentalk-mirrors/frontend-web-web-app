// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Grid, styled } from '@mui/material';

import { isFirstStep, isLastStep } from '../../../utils/formikWizardUtils';

interface IControlProps {
  currentStepIndex: number;
  handlePrev: () => Promise<void>;
  handleNext: () => Promise<void>;
  stepCount: number;
}

const GridItem = styled(Grid)({
  flex: 1,
  justifyContent: 'flex-end',
  display: 'inline-flex',
});

const Controls = ({ currentStepIndex, stepCount, handleNext, handlePrev }: IControlProps) => {
  return (
    <Grid
      container
      spacing={1}
      sx={{
        justifyContent: 'space-between',
      }}
    >
      {!isFirstStep(currentStepIndex) && (
        <Grid item>
          <Button variant="text" size="small" onClick={handlePrev}>
            back
          </Button>
        </Grid>
      )}
      {!isLastStep(stepCount, currentStepIndex) && (
        <GridItem item>
          <Button size="small" onClick={handleNext}>
            next
          </Button>
        </GridItem>
      )}
      {isLastStep(stepCount, currentStepIndex) && (
        <GridItem item>
          <Button size="small" onClick={handleNext}>
            submit
          </Button>
        </GridItem>
      )}
    </Grid>
  );
};

export default Controls;
