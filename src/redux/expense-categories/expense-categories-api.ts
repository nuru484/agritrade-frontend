import { apiSlice } from "../api-slice";
import { toQueryString } from "@/lib/to-query-string";
import type {
  ICreateExpenseCategoryInput,
  IExpenseCategory,
  IExpenseCategoryResponse,
  IRegistryListQuery,
  IRegistryListResponse,
  IUpdateExpenseCategoryInput,
} from "@/types/registry.types";
import type { IMessageResponse } from "@/types/auth.types";

/** Expense vocabulary, mirroring the backend `/admin/expense-categories`. */
export const expenseCategoriesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getExpenseCategories: builder.query<
      IRegistryListResponse<IExpenseCategory>,
      IRegistryListQuery | void
    >({
      query: (params) =>
        `admin/expense-categories${toQueryString(params ?? {})}`,
      providesTags: (result) =>
        result
          ? [
              { type: "ExpenseCategories" as const, id: "LIST" },
              ...result.data.map((c) => ({
                type: "ExpenseCategories" as const,
                id: c.id,
              })),
            ]
          : [{ type: "ExpenseCategories" as const, id: "LIST" }],
    }),

    getExpenseCategory: builder.query<IExpenseCategoryResponse, string>({
      query: (id) => `admin/expense-categories/${id}`,
      providesTags: (_r, _e, id) => [{ type: "ExpenseCategories", id }],
    }),

    createExpenseCategory: builder.mutation<
      IExpenseCategoryResponse,
      ICreateExpenseCategoryInput
    >({
      query: (body) => ({
        url: "admin/expense-categories",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ExpenseCategories", id: "LIST" }],
    }),

    updateExpenseCategory: builder.mutation<
      IExpenseCategoryResponse,
      { id: string; body: IUpdateExpenseCategoryInput }
    >({
      query: ({ id, body }) => ({
        url: `admin/expense-categories/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "ExpenseCategories", id },
        { type: "ExpenseCategories", id: "LIST" },
      ],
    }),

    deactivateExpenseCategory: builder.mutation<
      IExpenseCategoryResponse,
      string
    >({
      query: (id) => ({
        url: `admin/expense-categories/${id}/deactivate`,
        method: "PATCH",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "ExpenseCategories", id },
        { type: "ExpenseCategories", id: "LIST" },
      ],
    }),

    activateExpenseCategory: builder.mutation<IExpenseCategoryResponse, string>(
      {
        query: (id) => ({
          url: `admin/expense-categories/${id}/activate`,
          method: "PATCH",
        }),
        invalidatesTags: (_r, _e, id) => [
          { type: "ExpenseCategories", id },
          { type: "ExpenseCategories", id: "LIST" },
        ],
      },
    ),

    deleteExpenseCategory: builder.mutation<IMessageResponse, string>({
      query: (id) => ({
        url: `admin/expense-categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "ExpenseCategories", id: "LIST" }],
    }),
  }),
});

export const {
  useGetExpenseCategoriesQuery,
  useGetExpenseCategoryQuery,
  useCreateExpenseCategoryMutation,
  useUpdateExpenseCategoryMutation,
  useDeactivateExpenseCategoryMutation,
  useActivateExpenseCategoryMutation,
  useDeleteExpenseCategoryMutation,
} = expenseCategoriesApi;
