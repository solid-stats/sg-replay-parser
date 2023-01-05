import dayjs from 'dayjs';

const formatTime = (timeInSeconds: number): DefaultTimeNomination['time'] => {
  const duration = dayjs.duration(timeInSeconds, 'seconds');

  return `${Math.floor(duration.asHours())}:${duration.format('mm:ss')}` as DefaultTimeNomination['time'];
};

export default formatTime;
