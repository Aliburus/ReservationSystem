import React from "react";

interface SeatLayout {
  aisleAfter: any;
  seatsPerRow: number;
  rows: number;
  columns: number;
  unavailableSeats: number[];
}

interface SeatMapProps {
  layout: SeatLayout;
  occupiedSeats: number[];
  selectedSeats: number[];
  onSeatSelect: (seatNumber: number) => void;
  maxSelectable?: number;
}

const SeatMap: React.FC<SeatMapProps> = ({
  layout,
  occupiedSeats,
  selectedSeats,
  onSeatSelect,
  maxSelectable = 4,
}) => {
  const getSeatStatus = (seatNumber: number) => {
    if (layout.unavailableSeats.includes(seatNumber)) return "unavailable";
    if (occupiedSeats.includes(seatNumber)) return "occupied";
    if (selectedSeats.includes(seatNumber)) return "selected";
    return "available";
  };

  const getSeatClass = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 border-green-300 text-green-800 hover:bg-green-200 cursor-pointer";
      case "selected":
        return "bg-blue-500 border-blue-600 text-white cursor-pointer";
      case "occupied":
        return "bg-red-100 border-red-300 text-red-800 cursor-pointer hover:bg-red-200";
      case "unavailable":
        return "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed";
      default:
        return "bg-gray-100 border-gray-300 text-gray-400";
    }
  };

  const handleSeatClick = (seatNumber: number) => {
    const status = getSeatStatus(seatNumber);
    if (status === "unavailable") return;

    // Dolu koltuklar da tıklanabilir olmalı
    onSeatSelect(seatNumber);
  };

  const renderSeat = (seatNumber: number, position: string) => {
    const status = getSeatStatus(seatNumber);

    return (
      <div
        key={seatNumber}
        onClick={() => handleSeatClick(seatNumber)}
        className={`
          w-8 h-8 sm:w-10 sm:h-10 rounded-t-lg border-2 flex items-center justify-center text-xs font-medium transition-all duration-200 
          ${getSeatClass(status)}
          ${position === "window" ? "rounded-b-sm" : ""}
        `}
        title={`Koltuk ${seatNumber} - ${
          status === "occupied"
            ? "Dolu"
            : status === "selected"
            ? "Seçili"
            : status === "unavailable"
            ? "Mevcut Değil"
            : "Boş"
        }`}
      >
        {seatNumber}
      </div>
    );
  };

  let seatNumber = 1;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
      <div className="flex items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Koltuk Seçimi</h3>
      </div>

      {/* Seat grid */}
      <div className="space-y-2 mb-6">
        {Array.from({ length: layout.rows }, (_, rowIndex) => {
          const currentRow = rowIndex + 1;
          const seatsInRow = [];

          for (let i = 0; i < layout.seatsPerRow; i++) {
            const currentSeatNumber = seatNumber++;
            const position =
              i === 0 || i === layout.seatsPerRow - 1 ? "window" : "aisle";
            seatsInRow.push(renderSeat(currentSeatNumber, position));

            // Add aisle space
            if (
              layout.aisleAfter.includes(i + 1) &&
              i < layout.seatsPerRow - 1
            ) {
              seatsInRow.push(
                <div key={`aisle-${currentRow}-${i}`} className="w-4" />
              );
            }
          }

          return (
            <div
              key={currentRow}
              className="flex items-center justify-center space-x-1"
            >
              <div className="w-6 text-xs text-gray-500 text-center">
                {currentRow}
              </div>
              <div className="flex space-x-1">{seatsInRow}</div>
            </div>
          );
        })}
      </div>

      {/* Lejant */}
      <div className="flex gap-6 mt-4">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-green-100 border border-green-400 block"></span>
          <span>Boş</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-red-100 border border-red-400 block"></span>
          <span>Dolu</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
