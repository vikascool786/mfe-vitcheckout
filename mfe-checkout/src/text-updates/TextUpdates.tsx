import React from "react";
import "./TextUpdates.scss";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { FormField } from "../component/Form/Field/FormField";
import { Checkbox } from "../component/Form/Checkbox/Checkbox";
import { useAtom } from "jotai";
import { orderAtom } from "../store";
import { changeOrder } from "../api/service/Order";

export const TextUpdates = () => {
  const [order, setOrder] = useAtom(orderAtom);
  const [phone, setPhone] = React.useState<string>("");
  const [boxChecked, setBoxChecked] = React.useState<boolean>(false);

  const handleTextUpdates = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  };

  const handleSendOrderUpdates = () => {
    setBoxChecked(!boxChecked);
    if (phone.length > 9 && order) {
      setPhone(phone.slice(0, 10));
      changeOrder(
        {
          ...order,
          userOptions: {
            ...order.userOptions,
            smsPhone: phone,
          },
        },
        order.id
      ).then((response) => {
        if (!response.response.errors) {
          setOrder(response.response.success.data);
        }
      });
    }
  };
  return (
    <div className="tm-container">
      <FormHeading title="Text Updates for this Order" />
      <div className="tm-form-container">
        <FormField
          label="Mobile Phone"
          extraLabel="10 digits"
          required={boxChecked}
          onChange={handleTextUpdates}
        />
        <div className="save-for-later">
          <input
            className="checkbox"
            type="checkbox"
            onClick={handleSendOrderUpdates}
          />
          <span className="shipping-text">Send order updates</span>
        </div>
      </div>
      <div className="tm-rates">Message and data rates may apply.</div>
    </div>
  );
};
