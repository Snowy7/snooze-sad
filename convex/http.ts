import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal, api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/workos-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const bodyText = await request.text();
    const sigHeader = String(request.headers.get("workos-signature"));

    try {
      await ctx.runAction(internal.workos.verifyWebhook, {
        payload: bodyText,
        signature: sigHeader,
      });

      const { data, event } = JSON.parse(bodyText);

      switch (event) {
        case "user.created": {
          await ctx.runMutation(internal.users.upsertFromWorkOS, { 
            data: {
                ...data,
                external_id: data.id,
                profile_picture_url: data.profile_picture_url ?? "",
                email_verified: data.email_verified ?? false,
                last_sign_in_at: data.last_sign_in_at ?? "",
                created_at: data.created_at ?? new Date().toISOString(),
                updated_at: data.updated_at ?? new Date().toISOString(),
            }
           });
          break;
        }
        case "user.deleted": {
          const user = await ctx.runQuery(api.users.byWorkOSId, {
            workosId: data.id,
          });

          if (!user?._id) {
            throw new Error(`Unhandled event type: User not found: ${data.id}.`);
          }

          await ctx.runMutation(internal.users.deleteFromWorkOS, {
            workosId: data.id,
          });

          break;
        }
        case "user.updated": {
          const user = await ctx.runQuery(api.users.byWorkOSId, {
            workosId: data.id,
          });

          if (!user?._id) {
            // TODO: compose more sophisticated error messaging?
            throw new Error(`Unhandled event type: User not found: ${data.id}.`);
          }

          // For user updates, we can use the upsertFromWorkOS function
          await ctx.runMutation(internal.users.upsertFromWorkOS, { 
            data: {
                ...data,
                external_id: data.id,
                profile_picture_url: data.profile_picture_url ?? "",
                email_verified: data.email_verified ?? false,
                last_sign_in_at: data.last_sign_in_at ?? "",
                created_at: data.created_at ?? new Date().toISOString(),
                updated_at: data.updated_at ?? new Date().toISOString(),
            }
           });
          break;
        }
        default: {
          throw new Error(`Unhandled event type: ${event}`);
        }
      }

      return new Response(JSON.stringify({ status: "success" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      if (e instanceof Error) {
        if (e.message.includes("Unhandled event type")) {
          return new Response(
            JSON.stringify({
              status: "error",
              message: e.message,
            }),
            {
              status: 422,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }

      return new Response(
        JSON.stringify({
          status: "error",
          message: "Internal server error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

export default http;
