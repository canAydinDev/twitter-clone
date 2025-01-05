import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/clerk-sdk-node"; // <-- Dikkat!
import { createUserAction } from "@/lib/actions/user.actions";
import {
  addMemberToGroupAction,
  createGroupAction,
  deleteGroup,
  removeUserFromGroupAction,
  updateGroupInfo,
} from "@/lib/actions/group.actions";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error("Please add WEBHOOK_SECRET from Clerk Dashboard to .env");
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", { status: 400 });
  }

  if (evt.type === "user.created") {
    const user = evt.data;
    await createUserAction({
      userId: user.id,
      email: user.email_addresses[0].email_address,
      name: `${user.first_name || ""} ${user.last_name || ""}`,
      username: user.username || "",
      image: user.image_url || "",
      bio: "",
    });
  }

  if (evt.type === "organization.created") {
    console.log("Grup oluşturma tetiklendi.");
    const { id, name, slug, image_url, created_by } = evt.data;

    if (!created_by) {
      throw new Error("created_by değeri eksik!");
    }
    console.log("createGroupAction çağrılıyor:", {
      id,
      name,
      username: slug || "",
      image: image_url || "",
      createdById: created_by,
    });

    await createGroupAction({
      id,
      name,
      username: slug || "",
      image: image_url || "",
      createdById: created_by,
    });
  }

  if (evt.type === "organizationMembership.created") {
    const { organization, public_user_data } = evt.data;
    await addMemberToGroupAction(organization.id, public_user_data.user_id);
  }

  if (evt.type === "organizationMembership.deleted") {
    const { organization, public_user_data } = evt.data;
    await removeUserFromGroupAction(public_user_data.user_id, organization.id);
  }

  if (evt.type === "organization.updated") {
    const { id, image_url, name, slug } = evt.data;
    await updateGroupInfo(id, name, slug || "", image_url || "");
  }

  if (evt.type === "organization.deleted") {
    const { id } = evt.data;
    await deleteGroup(id || "");
  }

  return new Response("", { status: 200 });
}
