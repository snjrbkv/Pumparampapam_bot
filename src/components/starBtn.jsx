import { useState, useEffect } from "react";
import icons from "../assets/icons/icons.jsx";
import "../App.css";
import "./Modal.css";
import {
  useTonConnectUI,
  useTonWallet,
  UserRejectsError,
  TonConnectError,
} from "@tonconnect/ui-react";
import axios from "axios";
import { beginCell } from "@ton/ton";

// Helper function to generate a default transaction object
const defaultTx = (nano_amount = 0, to_wallet = "", body) => ({
  validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes from now
  messages: [
    {
      address: to_wallet,
      amount: nano_amount,
      payload: body,
    },
  ],
});

const StarBtnModal = ({ task_paid, task_days }) => {
  const [show, setShow] = useState(false);
  const [days, setDays] = useState(0);
  const [tons, setTons] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [initData, setInitData] = useState(null);
  const perDayTons = localStorage.getItem("TON_FOR_TASK") || 999;
  const maxDays = localStorage.getItem("TOTAL_DAY_FOR_TASK") || 999;

  const wallet = useTonWallet();
  const [tonConnectUi] = useTonConnectUI();

  useEffect(() => {
    const telegram = window.Telegram?.WebApp;
    if (telegram) {
      telegram.ready();
      setInitData(telegram.initData);
    }
  }, []);

  const handleShow = () => {
    setShow(true);
    setDays(0);
    setTons(0);
    setIsConfirmed(false);
  };

  const handleClose = () => setShow(false);

  const adjustDays = (change) => {
    setDays((prevDays) => {
      const newDays = Math.max(0, Math.min((maxDays - task_days), prevDays + change));
      setTons((newDays * perDayTons).toFixed(3));
      return newDays;
    });
  };

  const notifyBackendOfPending = async (uuid) => {
    try {
      const response = await axios.post(
        `https://api.pumparam.ru/api/transaction/${uuid}`,
        {
          initData: initData,
          status: "pending",
        },
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );

      if (response?.data?.ok) {
        localStorage.setItem("allowWallet", "I05pbmV0eURldg==");
        console.log(
          "Backend successfully notified of the successful transaction."
        );
      } else {
        console.error("Success to notify the backend:", response.data);
      }
    } catch (notifyError) {
      console.error("Error notifying the backend:", notifyError);
    }
  };

  const notifyBackendOfFailure = async (uuid, errorData) => {
    try {
      const response = await axios.post(
        `https://api.pumparam.ru/api/transaction/${uuid}`,
        {
          initData: initData,
          status: "failed", // Set status to failed
          extra: {
            // Storing error data in the 'extra' field as JSON
            errorMessage: errorData,
            timestamp: new Date().toISOString(), // Add any other useful info
          },
        },
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );

      if (response?.data?.ok) {
        console.log("Backend successfully notified of the failed transaction.");
      } else {
        console.error("Failed to notify the backend:", response.data);
      }
    } catch (notifyError) {
      console.error("Error notifying the backend:", notifyError);
    }
  };

  const notifyBackendOfSuccess = async (uuid, boc) => {
    try {
      const response = await axios.post(
        `https://api.pumparam.ru/api/transaction/${uuid}`,
        {
          initData: initData,
          status: "verifying", // Set status to verifying
          hash: boc,
          extra: {
            boc: boc,
            timestamp: new Date().toISOString(), // Add any other useful info
          },
        },
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );

      if (response?.data?.ok) {
        console.log(
          "Backend successfully notified of the successful transaction."
        );
      } else {
        console.error("Success to notify the backend:", response.data);
      }
    } catch (notifyError) {
      console.error("Error notifying the backend:", notifyError);
    }
  };

  const handleConfirm = async () => {
    if (!isConfirmed) {
      setIsConfirmed(true);
      return;
    }

    if (wallet && initData) {
      const dataToSend = { initData, days, reason: "forTask" };

      try {
        const { data } = await axios.post(
          "https://api.pumparam.ru/api/transactions/",
          dataToSend,
          {
            headers: {
              "Content-Type": "application/json; charset=utf-8",
            },
          }
        );

        if (data?.ok) {
          const { to_wallet, nano_amount, uuid } = data.data;
          const body = beginCell()
            .storeUint(0, 32) // 32 zero bits
            .storeStringTail("#" + uuid) // text comment
            .endCell();

          // Convert to Base64 using browser-compatible methods
          const tx = defaultTx(
            nano_amount,
            to_wallet,
            Buffer.from(body.toBoc()).toString("base64")
          );

          try {
            await notifyBackendOfPending(uuid);
            const result = await tonConnectUi.sendTransaction(tx);
            await notifyBackendOfSuccess(uuid, result.boc || null);
            console.log("Transaction was successful!", result);
          } catch (error) {
            if (error instanceof UserRejectsError) {
              console.error("User rejected the transaction:", error);
              await notifyBackendOfFailure(
                uuid,
                "User rejected the transaction"
              );
            } else if (error instanceof TonConnectError) {
              await tonConnectUi.disconnect();
              console.error("Error during transaction:", error);
              await notifyBackendOfFailure(
                uuid,
                error.message || "Unknown error"
              );
            } else {
              console.error("Error during transaction:", error);
              await notifyBackendOfFailure(
                uuid,
                error.message || "Unknown error"
              );
            }
          }
        } else {
          alert("Something went wrong. Please try again later.");
        }
      } catch (error) {
        console.error("API request failed:", error);
      }
    } else {
      tonConnectUi.openModal();
    }
  };

  return (
    <>
      <button className="star-btn" onClick={handleShow}>
        Boost for mini-transaction
        <img src={icons.star} alt="TON" />
      </button>

      <div
        className={`modal ${show ? "show" : ""}`}
        style={{ display: show ? "block" : "none" }}
        onClick={handleClose}
      >
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                  <button
                    className="btn-control"
                    onClick={() => adjustDays(-1)}
                  >
                    —
                  </button>
                  <span className="days">{days} дней</span>
                  <button className="btn-control" onClick={() => adjustDays(1)}>
                    +
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>Обменяйте TON за приглашение друзей и подключите кошелёк.</p>
                {wallet && <div></div>}
              </>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className={`btn ${isConfirmed ? "btn-secondary" : "btn-primary"}`}
              onClick={handleConfirm}
              disabled={days === 0 && !isConfirmed}
            >
              Обменять за {tons} TON
              <img
                className="ton-img w-20 d-inline-block"
                src={icons.star}
                alt="Change TON"
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StarBtnModal;
