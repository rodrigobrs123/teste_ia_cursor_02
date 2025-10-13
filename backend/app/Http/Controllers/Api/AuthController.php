<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'cpf' => 'required|string|size:14|unique:users',
            'data_nascimento' => 'required|date|before:today',
            'telefone' => 'required|string|max:20',
            'uf' => 'required|string|size:2',
            'estado' => 'required|string|max:100',
            'endereco' => 'required|string|max:500',
            'complemento' => 'nullable|string|max:200',
            'cep' => 'required|string|size:9',
        ]);

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'cpf' => $request->cpf,
                'data_nascimento' => $request->data_nascimento,
                'telefone' => $request->telefone,
                'uf' => $request->uf,
                'estado' => $request->estado,
                'endereco' => $request->endereco,
                'complemento' => $request->complemento,
                'cep' => $request->cep,
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Usuário cadastrado com sucesso',
                'data' => [
                    'user' => $user,
                    'token' => $token
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao cadastrar usuário'
            ], 500);
        }
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['As credenciais fornecidas estão incorretas.'],
            ]);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login realizado com sucesso',
            'data' => [
                'user' => $user,
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

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'cpf' => 'sometimes|string|size:14|unique:users,cpf,' . $user->id,
            'data_nascimento' => 'sometimes|date|before:today',
            'telefone' => 'sometimes|string|max:20',
            'uf' => 'sometimes|string|size:2',
            'estado' => 'sometimes|string|max:100',
            'endereco' => 'sometimes|string|max:500',
            'complemento' => 'nullable|string|max:200',
            'cep' => 'sometimes|string|size:9',
        ]);

        try {
            $user->update($request->only([
                'name', 'email', 'cpf', 'data_nascimento', 'telefone',
                'uf', 'estado', 'endereco', 'complemento', 'cep'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Perfil atualizado com sucesso',
                'data' => $user->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar perfil'
            ], 500);
        }
    }

    public function orders(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $orders = $user->orders()
            ->with('orderItems.product')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }
}