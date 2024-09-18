import React, { useState } from "react";
import icons from "../icons/icons";
import "../App.css";
import "./Modal.css"; // Ensure your custom styles are defined here

const StarBtnModal = () => {
  const [show, setShow] = useState(false);
  const [days, setDays] = useState(0); // Start with 0 days when the modal opens
  const [tons, setTons] = useState(0); // Start with 0 TON when the modal opens
  const [isConfirmed, setIsConfirmed] = useState(false); // State to track if the button is clicked

  const handleShow = () => {
    setShow(true);
    setDays(0); // Reset days to 0 when the modal opens
    setTons(0); // Reset tons to 0 when the modal opens
    setIsConfirmed(false); // Reset confirmation state
  };
  const handleClose = () => setShow(false);

  const incrementDays = () => {
    setDays((prevDays) => {
      const newDays = Math.min(100, prevDays + 1); // Increment days by 1 but not more than 100
      setTons(newDays * 2); // Calculate TON based on the new days value (2 TON per day)
      return newDays;
    });
  };

  const decrementDays = () => {
    setDays((prevDays) => {
      const newDays = Math.max(0, prevDays - 1); // Decrement days by 1 but not less than 0
      setTons(newDays * 2); // Calculate TON based on the new days value (2 TON per day)
      return newDays;
    });
  };

  const handleConfirm = () => {
    setIsConfirmed(true); // Set confirmed state to true
  };

  // Handle click outside of modal content
  const handleOverlayClick = (event) => {
    if (event.target.className.includes("modal show")) {
      handleClose();
    }
  };

  return (
    <>
      <button className="star-btn" onClick={handleShow}>
        Boost for mini-transaction
        <img src={icons.star} alt="Star" />
      </button>

      <div
        className={`modal ${show ? "show" : ""}`}
        style={{ display: show ? "block" : "none" }}
        onClick={handleOverlayClick} // Register the click handler here
      >
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          {" "}
          {/* Stop click event from bubbling up */}
          <div className="modal-header">
            <h5 className="modal-title">
              Boost for mini-transaction
              <img
                className="ton-img w-20 d-inline-block"
                src={icons.star}
                alt="Star"
              />
            </h5>
          </div>
          <div className="modal-body">
            {!isConfirmed ? (
              <>
                <p>Обменяйте TON за выполненные задания по дням.</p>
                <div className="d-flex align-items-center justify-content-center">
                  <button className="btn-control" onClick={decrementDays}>
                    —
                  </button>
                  <span className="days">{days} дней</span>
                  <button className="btn-control" onClick={incrementDays}>
                    +
                  </button>
                </div>
              </>
            ) : (
              <p>Обменяйте TON за приглашение друзей и подключите кошелёк.</p>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className={`btn ${isConfirmed ? "btn-secondary" : "btn-primary"}`}
              onClick={handleConfirm}
              disabled={days === 0 && !isConfirmed} // Disable button if days is 0 and not confirmed
            >
              Обменять за {tons} TON
              <img
                className="ton-img w-20 d-inline-block"
                src={icons.star}
                alt="Star"
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StarBtnModal;
