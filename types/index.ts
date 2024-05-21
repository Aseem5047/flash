// ====== USER PARAMS
export type CreateUserParams = {
	clerkId: string;
	firstName: string;
	lastName: string;
	username: string;
	photo: string;
	phone: any;
	role: string;
	bio?: string;
};

export type UpdateUserParams = {
	id?: string;
	fullName?: string;
	firstName: string;
	lastName: string;
	username: string;
	phone?: string;
	photo: string;
	bio?: string;
	role?: string;
};

export type CreateCreatorParams = {
	firstName?: string;
	lastName?: string;
	username: string;
	photo: string;
	phone: any;
	role: string;
	bio?: string;
};

export type UpdateCreatorParams = {
	fullName?: string;
	firstName?: string;
	lastName?: string;
	username: string;
	phone?: string;
	photo: string;
	role: string;
	bio?: string;
};
