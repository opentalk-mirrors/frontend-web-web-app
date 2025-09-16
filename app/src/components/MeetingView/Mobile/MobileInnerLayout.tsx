// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useAppSelector } from '../../../hooks';
import { selectShowCoffeeBreakCurtain } from '../../../store/slices/uiSlice';
import { CoffeeBreakMobileView } from '../../CoffeeBreakView/CoffeeBreakMobileView';
import MeetingHeader from '../../MeetingHeader';
import Toolbar from '../../Toolbar';
import MobileCinemaContainer from './MobileCinemaContainer';

const MobileInnerLayout = () => {
  const showCoffeeBreakCurtain = useAppSelector(selectShowCoffeeBreakCurtain);

  return (
    <>
      <MeetingHeader />
      {showCoffeeBreakCurtain ? <CoffeeBreakMobileView /> : <MobileCinemaContainer />}
      <Toolbar />
    </>
  );
};

export default MobileInnerLayout;
