import "./App.css";
import OrderHeader from "./components/OrderHeader";
import OrderSummary from "./components/OrderSummary";
import PaymentMethod from "./components/PaymentMethod";
import ShippingAddress from "./components/ShippingAddress";
import Container from "./layout/Container";
import SectionCard from "./layout/SectionCard";

const App = () => {
  const leftContent = (
    <>
      <OrderHeader
        orderId="1235378422"
        amount="13.42"
        deliveryDate="Tuesday, April 15"
        email="rubyb@shop.com"
      />

      <SectionCard title="Product Summary" rightText="Estimated Delivery Date Tuesday, April 15">
        <div className="product-card">
          <div className="product-image">
            <img
              src="https://via.placeholder.com/100x120"
              alt="Isotonix Calcium Plus"
            />
          </div>
          <div className="product-details">
            <h4>Isotonix Calcium Plus</h4>
            <p>Single Bottle (90 Servings)</p>
            <p>+ $0.52 Cashback</p>
            <p>Quantity: 1</p>
          </div>
          <div className="product-price">$25.00</div>
        </div>
      </SectionCard>

      <SectionCard title="Shipping Summary">
        <ShippingAddress
          name="Ruby Boyle"
          address="1 Lower Ragsdale Dr"
          cityStateZip="Monterey, CA 93940"
          phone="831-123-4567"
        />
      </SectionCard>
    </>
  );

  const rightContent = (
    <>
      <SectionCard title="Order Summary">
        <PaymentMethod method="Mastercard 0469" />
        <OrderSummary
          subtotal="$25.00"
          tax="$2.02"
          shipping="$6.00"
          cashback="$10.47"
          total="$12.55"
        />
        <div className="cashback-earned">
          <span>$0.25</span> VIFT Cashback Earned in this order
        </div>
      </SectionCard>

      <SectionCard title="VIFT Balance">
        <div className="vift-tag">
          <span>VIFT™</span>
          <strong>$13.42</strong>
        </div>
      </SectionCard>

      <SectionCard title="Order Updates">
        <label>
          <input type="checkbox" /> Want to receive text messages on this order?
        </label>
        <p className="disclaimer">Message and data rates may apply.</p>
      </SectionCard>
    </>
  );

  return <Container left={leftContent} right={rightContent} />;
};

export default App;
