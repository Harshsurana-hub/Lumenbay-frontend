/**
 * The tag written into each escrow's on-chain metadata at checkout.
 *
 *   lumenbay:<productId>:<buyerUserId>:<nonce>
 *
 * It ties the on-chain escrow to a listing and to the Lumenbay account that
 * paid, which is what lets the server record the order without trusting the
 * browser: it reads the tag back from the contract. The nonce keeps every
 * purchase unique, because the contract rejects a second escrow with the same
 * buyer, seller and metadata.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface OrderTag {
  productId: string;
  buyerUserId: string;
  nonce: string;
}

export function buildOrderTag(productId: string, buyerUserId: string, nonce: string = crypto.randomUUID()): string {
  return `lumenbay:${productId}:${buyerUserId}:${nonce}`;
}

/** Null for anything that isn't a well-formed tag, including the older two-part ones. */
export function parseOrderTag(tag: string | null | undefined): OrderTag | null {
  if (!tag) return null;
  const parts = tag.split(":");
  if (parts.length !== 4 || parts[0] !== "lumenbay") return null;
  const [, productId, buyerUserId, nonce] = parts;
  if (!UUID.test(productId) || !UUID.test(buyerUserId) || !nonce) return null;
  return { productId, buyerUserId, nonce };
}
