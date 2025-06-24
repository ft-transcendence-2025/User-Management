import { FastifyRequest, FastifyReply } from "fastify";
import { Profile, ProfileLanguage, UserGender } from "../../generated/prisma";
import { PrismaClientKnownRequestError } from "../../generated/prisma/runtime/library";
import { fileTypeFromBuffer } from "file-type";
import prisma from "../lib/prisma";

export const getAvatar = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const { username } = req.params as { username: string };
    if (!username) {
      return res.code(400).send({ message: "Username is required." });
    }

    const profile = await prisma.profile.findUnique({
      where: { userUsername: username },
      select: { avatar: true },
    });
    if (!profile || !profile.avatar) {
      return res.code(404).send({ message: "Avatar not found." });
    }

    // Detecta o tipo MIME dinamicamente
    const type = await fileTypeFromBuffer(profile.avatar as Buffer);
    res.header("Content-Type", type?.mime || "application/octet-stream");
    return res.send(profile.avatar as Buffer);
  } catch (err) {
    return res.code(500).send({ message: "Error fetching avatar", error: err });
  }
};

export const uploadAvatar = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const data = await req.file();
    if (!data) return res.code(400).send({ message: "No file uploaded" });

    const { username } = req.params as { username: string };
    const buffer = await data.toBuffer();

    const updatedProfile = await prisma.profile.update({
      where: { userUsername: username },
      data: { avatar: buffer },
    });
    return res.code(200).send({ message: "Avatar updated successfully." });
  } catch (err: unknown) {
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
      return res.code(404).send({ message: "Profile not found" });
    }
    return res
      .code(500)
      .send({ message: "Error uploading avatar", error: err });
  }
};

export const createProfile = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const { username } = req.params as { username: string };
    const { nickName, bio, gender, firstName, lastName, language } =
      req.body as {
        nickName?: string;
        bio?: string;
        gender?: UserGender;
        firstName?: string;
        lastName?: string;
        language?: ProfileLanguage;
      };

    if (!username) {
      return res.code(400).send({ message: "username is required." });
    }

    const user = await prisma.user.findUnique({
      where: { username: username },
    });
    if (!user) {
      return res.code(404).send({ message: "User does not exist." });
    }

    const existing = await prisma.profile.findUnique({
      where: { userUsername: username },
    });
    if (existing)
      return res.code(400).send({ message: "Profile already exists." });

    const profile = await prisma.profile.create({
      data: {
        userUsername: username,
        ...(nickName && { nickName }),
        ...(bio && { bio }),
        ...(gender && { gender }),
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(language && { language }),
      },
    });
    return res.code(201).send(profile);
  } catch (err) {
    return res
      .code(500)
      .send({ message: "Error creating profile", error: err });
  }
};

export const getProfileByUsername = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  try {
    const { username } = req.params as { username: string };

    const profile = await prisma.profile.findUnique({
      where: { userUsername: username },
      omit: {
        avatar: true,
      },
    });
    if (!profile) return res.code(404).send({ message: "Profile not found" });
    return res.send(profile);
  } catch (err) {
    return res
      .code(500)
      .send({ message: "Error fetching profile", error: err });
  }
};

export const updateProfile = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const { username } = req.params as { username: string };
    const data = req.body as Partial<Profile>;

    // Remove undefined fields, 'id' e 'avatar' para não atualizar esses campos
    const updateData = Object.fromEntries(
      Object.entries(data).filter(
        ([key, v]) => v !== undefined && key !== "id" && key !== "avatar"
      )
    );

    const profile = await prisma.profile.update({
      where: { userUsername: username },
      data: updateData,
    });
    return res.send({ message: "Profile updated" });
  } catch (err: unknown) {
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
      return res.code(404).send({ message: "Profile not found" });
    }
    return res
      .code(500)
      .send({ message: "Error updating profile", error: err });
  }
};

export const deleteProfile = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const { username } = req.params as { username: string };

    await prisma.profile.delete({
      where: { userUsername: username },
    });
    return res.code(200).send({ message: "Profile successfully deleted." });
  } catch (err: unknown) {
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
      return res.code(404).send({ message: "Profile not found" });
    }
    return res
      .code(500)
      .send({ message: "Error deleting profile", error: err });
  }
};
