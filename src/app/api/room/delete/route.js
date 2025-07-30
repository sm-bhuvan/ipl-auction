import connectDB from "@/lib/connectDB";
import Room from "@/models/Room";

export async function POST(req) {
  await connectDB();
  const { roomCode } = await req.json();
  await Room.deleteOne({ code: roomCode });
  return Response.json({ success: true });
}
