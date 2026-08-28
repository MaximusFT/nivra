import { CHECKOUT_LLD_VIEW_ID, COMMERCE_HLD_VIEW_ID } from "../../shared/ids";

export interface ElementLayout {
  elementId: string;
  x: number;
  y: number;
}

export interface ViewLayout {
  viewId: string;
  elements: ElementLayout[];
}

export const commerceLayouts: ViewLayout[] = [
  {
    viewId: COMMERCE_HLD_VIEW_ID,
    elements: [
      { elementId: "app-shell", x: 80, y: 260 },
      { elementId: "product-mfe", x: 340, y: 40 },
      { elementId: "cart-mfe", x: 340, y: 180 },
      { elementId: "checkout-mfe", x: 340, y: 320 },
      { elementId: "account-mfe", x: 340, y: 460 },
      { elementId: "shared-store", x: 600, y: 40 },
      { elementId: "backend-api", x: 600, y: 260 },
      { elementId: "product-service", x: 860, y: 120 },
      { elementId: "checkout-service", x: 860, y: 260 },
      { elementId: "auth-service", x: 860, y: 400 },
      { elementId: "commerce-db", x: 1120, y: 260 },
    ],
  },
  {
    viewId: CHECKOUT_LLD_VIEW_ID,
    elements: [
      { elementId: "checkout-page", x: 40, y: 220 },
      { elementId: "checkout-domain", x: 320, y: 220 },
      { elementId: "basket-adapter", x: 600, y: 40 },
      { elementId: "pricing-module", x: 600, y: 160 },
      { elementId: "payment-module", x: 600, y: 280 },
      { elementId: "order-module", x: 600, y: 400 },
      { elementId: "checkout-api-client", x: 600, y: 520 },
      { elementId: "product-store", x: 880, y: 40 },
      { elementId: "product-service", x: 880, y: 160 },
      { elementId: "checkout-service", x: 880, y: 520 },
    ],
  },
];
