import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";

export async function POST(req) {
  await connectDB();
  const { roomCode } = await req.json();

  const existing = await Room.findOne({ code: roomCode });
  if (existing) {
    return Response.json({ success: false, message: "Room code exists" }, { status: 409 });
  }

  const newRoom = new Room({ code: roomCode });
  await newRoom.save();

  return Response.json({ success: true, roomCode }, { status: 201 });
}