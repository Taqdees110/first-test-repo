import { AppError, RequestContext } from '@repo/core'
import { CustomLabEmployeeRepo } from '@repo/db'
import { container } from 'src/container/container'
import { AuthService } from 'src/services/auth-service'
import { UpdateEmployeeInput, UpdateEmployeeOutput } from './types'

export async function updateEmployee(ctx: RequestContext, args: UpdateEmployeeInput): Promise<UpdateEmployeeOutput> {
	const authService = container.get(AuthService)
	await authService.isLabUser(ctx)

	const customLabEmployeeRepo = container.get(CustomLabEmployeeRepo)

	const employee = await customLabEmployeeRepo.getEmployeeById(ctx, { employeeId: args.employeeId })
	if (!employee) {
		throw AppError.trpcNotFound('Employee not found')
	}

	const result = await customLabEmployeeRepo.updateEmployee(ctx, args)

	// Fetch the updated employee with company details
	const updatedEmployee = await customLabEmployeeRepo.getEmployeeById(ctx, { employeeId: args.employeeId })

	ctx.log.info(`Employee ${args.employeeId} updated successfully`)

	// Return the complete employee data instead of just the ID
	return updatedEmployee || result
}
//========================================================================================================================================
import { RequestContext } from '@repo/core'
import { and, eq } from 'drizzle-orm'
import { injectable } from 'inversify'
import { employees } from '../../db/tables/custom-lab/company'
import { companies } from '../../db/tables/custom-lab/company' // Import companies table
// ...existing code...

@injectable()
export class CustomLabEmployeeRepo {
    // ...existing code...

    async getEmployeeById(ctx: RequestContext, args: FindEmployeeByEmployeeIdInput): Promise<FindEmployeeByEmployeeIdOutput | undefined> {
        const result = await ctx.dbContext.db
            .select({
                id: employees.id,
                companyId: employees.companyId,
                customCompanyId: employees.customCompanyId,
                firstName: employees.firstName,
                lastName: employees.lastName,
                employeeEmail: employees.employeeEmail,
                employeePhone: employees.employeePhone,
                accessLevel: employees.accessLevel,
                isActive: employees.isActive,
                createdAt: employees.createdAt,
                updatedAt: employees.updatedAt,
                // Include company details
                customCompanyName: companies.companyName,
            })
            .from(employees)
            .leftJoin(companies, eq(employees.customCompanyId, companies.id))
            .where(and(eq(employees.id, args.employeeId), eq(employees.isDeleted, false)))
            .limit(1)

        return result[0]
    }
}
//======================================================================================================================================

// In your frontend component
const updateMutation = trpc.employee.update.useMutation({
  onSuccess: () => {
    // Invalidate and refetch
    trpcContext.employee.getById.invalidate()
    trpcContext.employee.list.invalidate()
    
    // Or refetch specific query
    refetchEmployee()
  }
})
