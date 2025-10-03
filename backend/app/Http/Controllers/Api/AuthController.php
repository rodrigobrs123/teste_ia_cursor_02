<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:customers',
            'cpf' => 'required|string|size:11|unique:customers',
            'date_of_birth' => 'nullable|date',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'password' => 'required|string|min:6|confirmed'
        ]);

        try {
            $customer = Customer::create([
                'name' => $request->name,
                'email' => $request->email,
                'cpf' => $request->cpf,
                'date_of_birth' => $request->date_of_birth,
                'phone' => $request->phone,
                'address' => $request->address,
                'password' => Hash::make($request->password)
            ]);

            $token = $customer->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Cliente registrado com sucesso',
                'data' => [
                    'customer' => $customer,
                    'token' => $token
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao registrar cliente: ' . $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $customer = Customer::where('email', $request->email)->first();

        if (!$customer || !Hash::check($request->password, $customer->password)) {
            throw ValidationException::withMessages([
                'email' => ['As credenciais fornecidas estão incorretas.'],
            ]);
        }

        $token = $customer->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login realizado com sucesso',
            'data' => [
                'customer' => $customer,
                'token' => $token
            ]
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout realizado com sucesso'
        ]);
    }

    public function profile(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $customer = $request->user();

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:customers,email,' . $customer->id,
            'cpf' => 'sometimes|required|string|size:11|unique:customers,cpf,' . $customer->id,
            'date_of_birth' => 'nullable|date',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'current_password' => 'required_with:password',
            'password' => 'nullable|string|min:6|confirmed'
        ]);

        try {
            if ($request->filled('password')) {
                if (!Hash::check($request->current_password, $customer->password)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Senha atual incorreta'
                    ], 400);
                }
                
                $customer->password = Hash::make($request->password);
            }

            $customer->fill($request->except(['password', 'current_password', 'password_confirmation']));
            $customer->save();

            return response()->json([
                'success' => true,
                'message' => 'Perfil atualizado com sucesso',
                'data' => $customer
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar perfil: ' . $e->getMessage()
            ], 500);
        }
    }
}