<?php

namespace Tests\Feature;

use Tests\TestCase;

class MercadoPagoConfigTest extends TestCase
{
    /** @test */
    public function it_returns_public_key_and_sandbox_flag()
    {
        $response = $this->getJson('/api/mercadopago/config');

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                 ])
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         'public_key',
                         'sandbox',
                     ],
                 ]);

        $data = $response->json('data');
        $this->assertNotEmpty($data['public_key']);
        $this->assertIsBool($data['sandbox']);
    }
}
