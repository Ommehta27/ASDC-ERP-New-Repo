import { UserRole } from "@prisma/client"

export type Permission =
  | "view_dashboard"
  | "view_students"
  | "create_students"
  | "edit_students"
  | "delete_students"
  | "view_batches"
  | "create_batches"
  | "edit_batches"
  | "delete_batches"
  | "manage_batch_students"
  | "view_inquiries"
  | "create_inquiries"
  | "edit_inquiries"
  | "delete_inquiries"
  | "view_enrollments"
  | "create_enrollments"
  | "edit_enrollments"
  | "delete_enrollments"
  | "view_courses"
  | "create_courses"
  | "edit_courses"
  | "delete_courses"
  | "view_centers"
  | "create_centers"
  | "edit_centers"
  | "delete_centers"
  | "view_placements"
  | "create_placements"
  | "edit_placements"
  | "delete_placements"
  | "view_inventory"
  | "create_inventory"
  | "edit_inventory"
  | "delete_inventory"
  | "allocate_inventory"
  | "view_procurement"
  | "manage_procurement"
  | "create_purchase_orders"
  | "edit_purchase_orders"
  | "approve_purchase_orders"
  | "view_vendors"
  | "create_vendors"
  | "edit_vendors"
  | "delete_vendors"
  | "view_finance"
  | "manage_finance"
  | "view_chart_of_accounts"
  | "create_accounts"
  | "edit_accounts"
  | "delete_accounts"
  | "view_setup"
  | "manage_setup"
  | "view_employees"
  | "create_employees"
  | "edit_employees"
  | "delete_employees"
  | "view_employee_profile"
  | "edit_employee_profile"
  | "view_attendance"
  | "mark_attendance"
  | "edit_attendance"
  | "view_leave"
  | "apply_leave"
  | "approve_leave"
  | "cancel_leave"
  | "view_leave_balance"
  | "manage_leave_types"
  | "view_performance"
  | "create_performance_review"
  | "edit_performance_review"
  | "view_training"
  | "create_training"
  | "enroll_training"
  | "complete_training"
  | "view_payroll"
  | "process_payroll"
  | "approve_payroll"
  | "view_salary_structure"
  | "edit_salary_structure"
  | "view_assets"
  | "assign_assets"
  | "return_assets"
  | "view_onboarding"
  | "manage_onboarding"
  | "view_exit"
  | "process_exit"
  | "view_documents"
  | "upload_documents"
  | "verify_documents"
  | "view_company_info"
  | "edit_company_info"
  | "view_analytics"
  | "view_powerbi"
  | "manage_users"
  | "approve_level_1"
  | "approve_level_2"
  | "approve_level_3"
  | "view_budgets"
  | "create_budgets"
  | "edit_budgets"
  | "delete_budgets"
  | "approve_budgets"
  | "view_budget_reports"
  | "manage_budget_periods"
  | "manage_cost_centers"
  | "view_variance_analysis"
  | "create_budget_alerts"
  | "manage_budget_versions"
  | "view_workflows"
  | "create_workflows"
  | "edit_workflows"
  | "delete_workflows"
  | "execute_workflows"
  | "view_workflow_logs"
  | "manage_api_connections"
  | "view_workflow_templates"

const rolePermissions: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    "view_dashboard",
    "view_students",
    "create_students"
,
    "edit_students",
    "delete_students",
    "view_batches",
    "create_batches",
    "edit_batches",
    "delete_batches",
    "manage_batch_students",
    "view_inquiries",
    "create_inquiries",
    "edit_inquiries",
    "delete_inquiries",
    "view_enrollments",
    "create_enrollments",
    "edit_enrollments",
    "delete_enrollments",
    "view_courses",
    "create_courses",
    "edit_courses",
    "delete_courses",
    "view_centers",
    "create_centers",
    "edit_centers",
    "delete_centers",
    "view_placements",
    "create_placements",
    "edit_placements",
    "delete_placements",
    "view_inventory",
    "create_inventory",
    "edit_inventory",
    "delete_inventory",
    "allocate_inventory",
    "view_procurement",
    "manage_procurement",
    "create_purchase_orders",
    "edit_purchase_orders",
    "approve_purchase_orders",
    "view_vendors",
    "create_vendors",
    "edit_vendors",
    "delete_vendors",
    "view_finance",
    "manage_finance",
    "view_chart_of_accounts",
    "create_accounts",
    "edit_accounts",
    "delete_accounts",
    "view_setup",
    "manage_setup",
    "view_employees",
    "create_employees",
    "edit_employees",
    "delete_employees",
    "view_employee_profile",
    "edit_employee_profile",
    "view_attendance",
    "mark_attendance",
    "edit_attendance",
    "view_leave",
    "apply_leave",
    "approve_leave",
    "cancel_leave",
    "view_leave_balance",
    "manage_leave_types",
    "view_performance",
    "create_performance_review",
    "edit_performance_review",
    "view_training",
    "create_training",
    "enroll_training",
    "complete_training",
    "view_payroll",
    "process_payroll",
    "approve_payroll",
    "view_salary_structure",
    "edit_salary_structure",
    "view_assets",
    "assign_assets",
    "return_assets",
    "view_onboarding",
    "manage_onboarding",
    "view_exit",
    "process_exit",
    "view_documents",
    "upload_documents",
    "verify_documents",
    "view_company_info",
    "edit_company_info",
    "view_analytics",
    "view_powerbi",
    "manage_users",
    "approve_level_1",
    "approve_level_2",
    "approve_level_3",
    "view_budgets",
    "create_budgets",
    "edit_budgets",
    "delete_budgets",
    "approve_budgets",
    "view_budget_reports",
    "manage_budget_periods",
    "manage_cost_centers",
    "view_variance_analysis",
    "create_budget_alerts",
    "manage_budget_versions",
    "view_workflows",
    "create_workflows",
    "edit_workflows",
    "delete_workflows",
    "execute_workflows",
    "view_workflow_logs",
    "manage_api_connections",
    "view_workflow_templates",
  ],
  CENTER_DIRECTOR: [
    "view_dashboard",
    "view_students",
    "create_students",
    "edit_students",
    "view_batches",
    "create_batches",
    "edit_batches",
    "manage_batch_students",
    "view_inquiries",
    "create_inquiries",
    "edit_inquiries",
    "view_enrollments",
    "create_enrollments",
    "edit_enrollments",
    "view_courses",
    "view_placements",
    "create_placements",
    "edit_placements",
    "view_inventory",
    "create_inventory",
    "edit_inventory",
    "allocate_inventory",
    "view_procurement",
    "create_purchase_orders",
    "view_employees",
    "view_analytics",
    "view_powerbi",
    "approve_level_1",
  ],
  TRAINER: [
    "view_dashboard",
    "view_students",
    "view_batches",
    "view_courses",
    "view_enrollments",
    "view_inventory",
    "view_analytics",
  ],
  PLACEMENT_OFFICER: [
    "view_dashboard",
    "view_students",
    "view_placements",
    "create_placements",
    "edit_placements",
    "view_analytics",
  ],
  COUNSELOR: [
    "view_dashboard",
    "view_inquiries",
    "create_inquiries",
    "edit_inquiries",
    "view_enrollments",
    "create_enrollments",
    "view_students",
  ],
  STUDENT: [
    "view_dashboard",
    "create_inquiries",
  ],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission))
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission))
}

export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role] ?? []
}
