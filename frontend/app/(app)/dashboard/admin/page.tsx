"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPut } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { User } from "@/lib/types";
import { NeoBadge, NeoButton, NeoCard, NeoSelect } from "@/components/neo-ui";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";

type AdminUser = User & {
	role: "admin" | "user";
	isActive: boolean;
	createdAt: string;
};

const roleOptions = [
	{ value: "user", label: "User" },
	{ value: "admin", label: "Admin" },
];

export default function AdminPage() {
	const { user } = useAuth();
	const router = useRouter();
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [updatingId, setUpdatingId] = useState<string | null>(null);

	const isAdmin = user?.role === "admin";

	const sortedUsers = useMemo(() => {
		return [...users].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	}, [users]);

	useEffect(() => {
		if (!user) {
			return;
		}
		if (!isAdmin) {
			return;
		}

		const loadUsers = async () => {
			try {
				const data = await apiGet("/admin/users");
				setUsers(data || []);
			} catch (error) {
				toast({
					title: "Could not load users",
					description: getErrorMessage(error, "Try again."),
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		};

		loadUsers();
	}, [user, isAdmin]);

	const updateRole = async (userId: string, role: "admin" | "user") => {
		setUpdatingId(userId);
		try {
			const updated = await apiPut(`/admin/users/${userId}/role`, { role });
			setUsers((prev) => prev.map((u) => (u._id === userId ? updated : u)));
			toast({
				title: "Role updated",
				description: `${updated.name} is now ${updated.role}.`,
			});
		} catch (error) {
			toast({
				title: "Could not update role",
				description: getErrorMessage(error, "Try again."),
				variant: "destructive",
			});
		} finally {
			setUpdatingId(null);
		}
	};

	const updateStatus = async (userId: string, isActive: boolean) => {
		setUpdatingId(userId);
		try {
			const updated = await apiPut(`/admin/users/${userId}/status`, {
				isActive,
			});
			setUsers((prev) => prev.map((u) => (u._id === userId ? updated : u)));
			toast({
				title: "Account updated",
				description: `${updated.name} is now ${updated.isActive ? "active" : "inactive"}.`,
			});
		} catch (error) {
			toast({
				title: "Could not update status",
				description: getErrorMessage(error, "Try again."),
				variant: "destructive",
			});
		} finally {
			setUpdatingId(null);
		}
	};

	if (!user) {
		return null;
	}

	if (!isAdmin) {
		return (
			<div className="min-h-[70vh] flex items-center justify-center p-6">
				<NeoCard className="max-w-md p-6 text-center space-y-4">
					<h1 className="text-2xl font-bold">Access denied</h1>
					<p className="text-gray-600">You do not have access to this page.</p>
					<NeoButton variant="secondary" onClick={() => router.push("/dashboard")}>
						Back to hub
					</NeoButton>
				</NeoCard>
			</div>
		);
	}

	return (
		<div className="p-4 md:p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl md:text-3xl font-bold">Admin lab</h1>
					<p className="text-gray-600">Roles and account access, simplified.</p>
				</div>
			</div>

			<NeoCard className="p-4 md:p-6">
				{loading ? (
					<div className="py-8 text-center text-gray-600">Loading users...</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Action</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{sortedUsers.map((entry) => (
								<TableRow key={entry._id}>
									<TableCell className="font-medium">{entry.name}</TableCell>
									<TableCell>{entry.email}</TableCell>
									<TableCell>
										<div className="w-36">
											<NeoSelect
												options={roleOptions}
												value={entry.role}
												disabled={updatingId === entry._id}
												onChange={(event) =>
													updateRole(entry._id, event.target.value as "admin" | "user")
												}
											/>
										</div>
									</TableCell>
									<TableCell>
										<NeoBadge variant={entry.isActive ? "accent" : "destructive"}>
											{entry.isActive ? "Active" : "Inactive"}
										</NeoBadge>
									</TableCell>
									<TableCell>
										<NeoButton
											variant={entry.isActive ? "warning" : "accent"}
											size="sm"
											disabled={updatingId === entry._id}
											onClick={() => updateStatus(entry._id, !entry.isActive)}
										>
											{entry.isActive ? "Deactivate" : "Activate"}
										</NeoButton>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</NeoCard>
		</div>
	);
}
