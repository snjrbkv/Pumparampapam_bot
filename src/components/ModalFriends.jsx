import { useState, useEffect } from "react";
import icons from "../assets/icons/icons.jsx";
import "../App.css";
import "./Modal.css"; 
import { useTonConnectUI, useTonWallet, UserRejectsError, TonConnectError } from "@tonconnect/ui-react";
import axios from "axios";
import { beginCell } from '@ton/ton';

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

const ModalFriends = ({ task_paid }) => {
  const [show, setShow] = useState(false);
  const [initData, setInitData] = useState(null);
  const referalBoostPrice = localStorage.getItem("TON_FOR_REFERRAL") || 99;

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
  };

  const handleClose = () => setShow(false);

  const notifyBackendOfPending = async (uuid) => {
    try {
      const response = await axios.post(
        `https://api.pumparam.ru/api/transaction/${uuid}`,
        {
          initData: initData,
          status: 'pending',
        },
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          }
        }
      );
  
      if (response?.data?.ok) {
        console.log("Backend successfully notified of pending transaction.");
      } else {
        console.error("Failed to notify backend:", response.data);
      }
    } catch (error) {
      console.error("Error notifying backend:", error);
    }
  };

  const notifyBackendOfFailure = async (uuid, errorData) => {
    try {
      const response = await axios.post(
        `https://api.pumparam.ru/api/transaction/${uuid}`,
        {
          initData: initData,
          status: 'failed',
          extra: { errorMessage: errorData, timestamp: new Date().toISOString() },
        },
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          }
        }
      );
  
      if (response?.data?.ok) {
        console.log("Backend successfully notified of failed transaction.");
      } else {
        console.error("Failed to notify backend:", response.data);
      }
    } catch (error) {
      console.error("Error notifying backend:", error);
    }
  };

  const notifyBackendOfSuccess = async (uuid, boc) => {
    try {
      const response = await axios.post(
        `https://api.pumparam.ru/api/transaction/${uuid}`,
        {
          initData: initData,
          status: 'verifying',
          hash: boc,
          extra: { boc, timestamp: new Date().toISOString() },
        },
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          }
        }
      );
  
      if (response?.data?.ok) {
        console.log("Backend successfully notified of successful transaction.");
        localStorage.setItem("allowWallet", "I05pbmV0eURldg==");
      } else {
        console.error("Failed to notify backend:", response.data);
      }
    } catch (error) {
      console.error("Error notifying backend:", error);
    }
  };

  const handleConfirm = async () => {
    if (wallet && initData) {
      const dataToSend = { initData, reason: "forReferral" };

      try {
        const { data } = await axios.post("https://api.pumparam.ru/api/transactions/", dataToSend, {
          headers: { "Content-Type": "application/json; charset=utf-8" }
        });

        if (data?.ok) {
          const { to_wallet, nano_amount, uuid } = data.data;
          const body = beginCell().storeUint(0, 32).storeStringTail("#" + uuid).endCell();

          const tx = defaultTx(nano_amount, to_wallet, Buffer.from(body.toBoc()).toString("base64"));

          try {
            await notifyBackendOfPending(uuid);
            const result = await tonConnectUi.sendTransaction(tx);
            await notifyBackendOfSuccess(uuid, result.boc || null);
            console.log("Transaction successful!", result);
          } catch (error) {
            if (error instanceof UserRejectsError) {
              console.error("User rejected the transaction:", error);
              await notifyBackendOfFailure(uuid, "User rejected the transaction");
            } else if (error instanceof TonConnectError) {
              await tonConnectUi.disconnect();
              console.error("Transaction error:", error);
              await notifyBackendOfFailure(uuid, error.message || "Unknown error");
            } else {
              console.error("Transaction error:", error);
              await notifyBackendOfFailure(uuid, error.message || "Unknown error");
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

  const handleOverlayClick = (event) => {
    if (event.target.className.includes("modal show")) {
      handleClose();
    }
  };

  return (
    <>
      {!task_paid && (
      <button className="star-btn" onClick={handleShow}>
        Boost for referral transaction
        <img src={icons.star} alt="Star" />
      </button>
      )}

      <div
        className={`modal ${show ? "show" : ""}`}
        style={{ display: show ? "block" : "none" }}
        onClick={handleOverlayClick}
      >
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h5 className="modal-title">
              Boost for referral transaction
              <img className="ton-img w-20 d-inline-block" src={icons.star} alt="Star" />
            </h5>
          </div>
          <div className="modal-body">
            <p>Обменяйте TON за приглашение друзей и подключите кошелёк.</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleConfirm}
            >
              Обменять за {referalBoostPrice} TON
              <img className="ton-img w-20 d-inline-block" src={icons.star} alt="TON" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalFriends;
