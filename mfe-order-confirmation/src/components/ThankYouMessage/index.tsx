import React from "react";

interface ThankYouMessageProps {
  name: string;
  email: string;
}

const ThankYouMessage: React.FC<ThankYouMessageProps> = ({ name, email }) => {
  return (
    <section>
      <p>
        {name}, thank you for shopping with us!
        <br />
        We sent a confirmation email to {email}
      </p>
    </section>
  );
};

export default ThankYouMessage;
