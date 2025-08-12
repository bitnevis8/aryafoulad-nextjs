"use client";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();
  return null;
}

