<template>
  <q-page
    class="window-height window-width row justify-center items-center"
    style="background: #393e46"
  >
    <div class="column">
      <div class="row">
        <h5 class="text-h5 text-white q-my-md">Budget</h5>
      </div>
      <div class="row">
        <q-card square bordered class="q-pa-lg shadow-1">
          <q-card-section>
            <q-form class="q-gutter-md">
              <q-input
                square
                filled
                clearable
                v-model="state.email"
                type="email"
                label="email"
              />
              <q-input
                square
                filled
                clearable
                v-model="state.password"
                type="password"
                label="password"
              />
            </q-form>
          </q-card-section>
          <div class="error" v-if="state.error">
            {{ state.error }}
          </div>
          <q-card-actions class="q-px-md" @click="prijavaKorisnika()">
            <q-btn
              unelevated
              color="light-green-7"
              size="lg"
              class="full-width"
              label="Prijava"
            />
          </q-card-actions>
          <div class="alternative-option mt-4 text-grey-6 text-center">
            Nemaš račun?
            <span @click="registracija" style="color: blue; cursor: pointer"
              >Registriraj se!</span
            >
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, reactive } from "vue";
import { useRouter } from "vue-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../boot/firebase";
import { doc, getDoc } from "@firebase/firestore";

export default defineComponent({
  name: "PrijavaKorisnika",
  setup() {
    const state = reactive({
      email: null,
      password: null,
      error: null,
    });
    const router = useRouter();

    const podaciKorisnika = async (uid) => {
      const docRef = doc(db, "korisnik", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        alert("Korisnik nije pronadjen... Molimo pokušajte ponovno!");
        router.push("/prijava");
      }
    };

    const prijavaKorisnika = () => {
      signInWithEmailAndPassword(auth, state.email, state.password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const podaci = await podaciKorisnika(user.uid);

          if (podaci.id_budzeta !== "") {
            router.push("/");
          } else {
            router.push("/izbor-budzeta");
          }
        })
        .catch((error) => {
          state.error = "Nešto je pošlo po zlu!";
        });
    };

    const registracija = () => {
      router.push("/registracija");
    };

    return { state, prijavaKorisnika, registracija };
  },
});
</script>

<style>
.q-card {
  width: 360px;
}
</style>
