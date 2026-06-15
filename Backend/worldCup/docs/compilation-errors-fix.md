# Errores de Compilación — Análisis y Correcciones

**Fecha:** 2026-06-10  
**Build:** maven-compiler-plugin 3.14.1 · Spring Boot 3.5.13 · Java 21

---

## Resumen

100 errores en 7 archivos con dos causas raíz distintas.

| # | Causa raíz | Archivos afectados | Errores |
|---|---|---|---|
| 1 | Lombok no procesa anotaciones | 6 clases | ~98 |
| 2 | Método `refund` duplicado | `MercadoPagoMockGateway` | 1 |

---

## Causa Raíz 1 — Lombok sin procesar (`<proc>full</proc>` faltante)

### Síntomas

Todos los errores del tipo `cannot find symbol` sobre:

- `variable log` en clases con `@Slf4j`
- `method getId()`, `getName()`, `getStatus()`, etc. en entidades con `@Getter`
- `method setX(...)` en entidades con `@Setter`

### Archivos afectados

| Archivo | Errores |
|---|---|
| `common/exception/GlobalExceptionHandler.java` | `variable log` |
| `config/AppConfigService.java` | `getConfigValue`, `setConfigKey`, `setConfigValue`, `setUpdatedAt` |
| `external/AdminConfigController.java` | `Tournament.getId()` × 4 |
| `external/ExternalFixtureService.java` | ~35 errores (todos los getters/setters de `Fixture`, `Team`, `GroupStage`) |
| `tournament/service/StandingsCalculatorService.java` | ~25 errores (`Fixture`, `GroupStage`, `GroupStanding`, `Team`) |
| `tournament/integration/sync/FixtureSyncService.java` | ~10 errores (`log`, `Fixture.getId`, setters) |

### Por qué ocurre

`maven-compiler-plugin 3.12+` cambió el comportamiento por defecto del procesamiento de anotaciones. Cuando se especifica `annotationProcessorPaths`, las versiones ≥ 3.12 pueden omitir el paso de procesamiento completo si no se declara explícitamente `<proc>full</proc>`. El resultado es que Lombok nunca ejecuta su procesador y **ningún getter, setter ni campo `log` es generado**.

Spring Boot 3.5.13 gestiona la versión 3.14.1 de este plugin, que exhibe este comportamiento.

### Corrección aplicada — `pom.xml`

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <release>${java.version}</release>
        <proc>full</proc>   <!-- ← línea añadida -->
        <annotationProcessorPaths>
            <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>1.18.38</version>
            </path>
            <path>
                <groupId>org.mapstruct</groupId>
                <artifactId>mapstruct-processor</artifactId>
                <version>${mapstruct.version}</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

`<proc>full</proc>` equivale a `-proc:full` en javac: fuerza la compilación Y el procesamiento de anotaciones en el mismo paso, que es el comportamiento esperado para Lombok.

---

## Causa Raíz 2 — Método duplicado en `MercadoPagoMockGateway`

### Síntoma

```
[ERROR] method refund(java.lang.String) is already defined in class
        com.mundial2026.backend.subscription.service.MercadoPagoMockGateway
```

### Archivo afectado

`subscription/service/MercadoPagoMockGateway.java` líneas 83–91

### Causa

El método `refund(String paymentId)` fue definido dos veces con el mismo cuerpo. Probablemente un copia-pega accidental.

### Corrección aplicada

Se eliminó el segundo bloque (líneas 88–91), dejando una única implementación:

```java
@Override
public void refund(String paymentId) {
    log.info("[MOCK MercadoPago] Reembolso simulado paymentId={} → OK", paymentId);
}
```

---

## Verificación

Tras aplicar ambas correcciones, compilar con:

```bash
./mvnw clean compile
```

El resultado esperado es `BUILD SUCCESS` sin errores de compilación.

---

## Checklist de cambios

- [x] `pom.xml` — añadido `<proc>full</proc>` en `maven-compiler-plugin`
- [x] `MercadoPagoMockGateway.java` — eliminado método `refund` duplicado
