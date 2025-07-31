import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";

export async function POST(req) {
  await connectDB();
  const { roomCode } = await req.json();

  const existing = await Room.findOne({ code: roomCode });
  if (existing) {
    return Response.json({ success: true, message: "Room code exists" }, { status: 201 });
  }
  return Response.json({ success: false, message: "Room doesn't exist", roomCode }, { status: 404 });
}