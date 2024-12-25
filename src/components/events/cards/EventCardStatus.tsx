interface EventCardStatusProps {
  remainingSeats: number;
  maxAttendees: number;
  status: {
    text: string;
    color: string;
  };
}

export const EventCardStatus = ({
  remainingSeats,
  maxAttendees,
  status
}: EventCardStatusProps) => {
  if (!maxAttendees) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-gray-600 text-sm">
        <span>{maxAttendees - remainingSeats} من {maxAttendees} مشارك</span>
      </div>
      <div className={`text-center py-1 px-2 rounded-md text-white ${status.color}`}>
        {status.text}
      </div>
    </div>
  );
};