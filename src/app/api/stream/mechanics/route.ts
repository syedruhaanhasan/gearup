import { getMechanicsLive } from "@/lib/mechanics-live";
import { realtime } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  const signal = request.signal;

  const stream = new ReadableStream({
    async start(controller) {
      const send = async () => {
        try {
          const mechanics = await getMechanicsLive();
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ mechanics })}\n\n`),
          );
        } catch {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "failed_to_load" })}\n\n`,
            ),
          );
        }
      };

      await send();
      const onEvent = () => {
        void send();
      };
      realtime.on("mechanics", onEvent);

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(`: ping\n\n`));
      }, 25000);

      const close = () => {
        clearInterval(keepAlive);
        realtime.off("mechanics", onEvent);
      };

      signal.addEventListener(
        "abort",
        () => {
          close();
          try {
            controller.close();
          } catch {
            /* ignore */
          }
        },
        { once: true },
      );
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
