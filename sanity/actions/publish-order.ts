import { DocumentActionComponent, useClient, useDocumentOperation } from "sanity";
import { useState, useEffect } from "react";

export const PublishOrderAction: DocumentActionComponent = (props) => {
  const { patch, publish } = useDocumentOperation(props.id, props.type);
  const client = useClient({ apiVersion: "2024-01-01" });
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (isPublishing && !props.draft) {
      setIsPublishing(false);
    }
  }, [props.draft, isPublishing]);

  return {
    disabled: !!publish.disabled,
    title: typeof publish.disabled === 'string' ? publish.disabled : undefined,
    label: isPublishing ? "Publishing..." : "Publish",
    onHandle: async () => {
      setIsPublishing(true);

      // 1. Perform the default publish
      publish.execute();

      // 2. Fetch the draft (or published if no draft) to get data
      // Note: validation happens before this, so we assume data is valid if publish succeeds.
      // However, publish.execute is async in effect but synchronous in call. 
      // We'll read the draft state currently in the form props or fetch latest.

      const doc = props.draft || props.published;

      if (!doc || !doc.reservationDate || !doc.items) {
        setIsPublishing(false);   // If data is missing, we just stop here.
        return;
      }

      const { reservationDate, items } = doc;

      // 3. Patch the products
      try {
        const productIds = (items as any[])
          .map((item: any) => item.product?._ref)
          .filter(Boolean);

        if (productIds.length > 0) {
          // We use a transaction or individual patches. Since we might be blocking the same date on multiple products:
          const transaction = client.transaction();

          productIds.forEach((id: string) => {
            transaction.patch(id, (p) =>
              p.setIfMissing({ blockedDates: [] })
                .append("blockedDates", [reservationDate])
            );
          });

          await transaction.commit();
          console.log(`[PublishOrderAction] Blocked date ${reservationDate} for products:`, productIds);
        }
      } catch (err) {
        console.error("[PublishOrderAction] Failed to update blocked dates:", err);
      }

      props.onComplete();
    },
  };
};
