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
                v-model="state.ime"
                label="ime"
                :error="state.errors && state?.errors['ime'] ? true : false"
              />
              <div class="error" v-if="state.errors && state.errors['ime']">
                {{ state?.errors["ime"] }}
              </div>
              <q-input
                square
                filled
                clearable
                v-model="state.prezime"
                label="prezime"
                :error="state.errors && state?.errors['prezime'] ? true : false"
              />
              <div class="error" v-if="state.errors && state.errors['prezime']">
                {{ state?.errors["prezime"] }}
              </div>
              <q-input
                square
                filled
                clearable
                v-model="state.email"
                type="email"
                label="email"
                :error="state.errors && state?.errors['email'] ? true : false"
              />
              <div class="error" v-if="state.errors && state.errors['email']">
                {{ state?.errors["email"] }}
              </div>
              <q-input
                square
                filled
                clearable
                v-model="state.password"
                type="password"
                label="password"
                :error="
                  state.errors && state?.errors['password'] ? true : false
                "
              />
              <div
                class="error"
                v-if="state.errors && state.errors['password']"
              >
                {{ state?.errors["password"] }}
              </div>
            </q-form>
          </q-card-section>
          <q-card-actions class="q-px-md">
            <q-btn
              @click="registracija"
              unelevated
              color="light-green-7"
              size="lg"
              class="full-width"
              label="REGISTRACIJA"
            />
          </q-card-actions>
          <div class="alternative-option mt-4 text-grey-6 text-center">
            Već imaš račun?
            <span @click="prijava" style="color: blue; cursor: pointer"
              >Prijavi se!</span
            >
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { createUserWithEmailAndPassword } from "@firebase/auth";
import { doc, setDoc } from "@firebase/firestore";
import { auth, db } from "src/boot/firebase";
import { defineComponent, reactive } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "RegistracijaKorisnika",
  setup() {
    const state = reactive({
      id_korisnika: null,
      email: null,
      password: null,
      ime: null,
      prezime: null,
      error: null,
      errors: {},
    });

    const router = useRouter();
//zanimljivo
    const validacija = () => {
      let valid = true;
      state.errors = {};
      let emailReg = new RegExp(
        "^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$"
      ); // ovo je za registraciju
      let passwordReg = new RegExp(
        "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).*$"
      );
      if (
        state.ime === 0 &&
        state.prezime === "" &&
        state.email === "" &&
        state.password === ""
      ) {
        valid = false;
        state.errors = {
          ime: "Unesite ime",
          prezime: "Unesite prezime",
          email: "Unesite email",
          password: "Unesite šifru",
        };
      } else {
        if (state.ime === 0 || state.ime === "" || state.ime === null) {
          state.errors["ime"] = "Unesite ime";
          valid = false;
        }
        if (state.prezime === "" || state.prezime === null) {
          state.errors["prezime"] = "Unesite opis";
          valid = false;
        }
        if (!emailReg.test(state.email)) {
          state.errors["email"] = "Unesite ispravnu email adresu";
          valid = false;
        }
        if (!passwordReg.test(state.password)) {
          state.errors["password"] =
            "Unesite lozinku koja sadrži kombinaciju velikih, malih slova, neki znak i broj";
          valid = false;
        }
      }
      return valid;
    };

    const registracija = async () => {
      let valid = validacija();
      if (valid) {
        await createUserWithEmailAndPassword(auth, state.email, state.password)
          .then((userCredential) => {
            const user = userCredential.user;
            state.id_korisnika = user.uid;
            spremiKorisnika();
          })
          .catch((error) => {
            state.error = "Ne valja";
          });
      }
    };

    const spremiKorisnika = async () => {
      await setDoc(doc(db, "korisnik", state.id_korisnika), {
        ime: state.ime,
        prezime: state.prezime,
        email: state.email,
        id_budzeta: "",
      });
      router.push("/izbor-budzeta");
    };

    const prijava = () => {
      router.push("/prijava");
    };
    return { state, registracija, prijava, spremiKorisnika };
  },
});
</script>

<style>
.q-card {
  width: 360px;
}
.error {
  color: red;
  font-size: 12px;
  margin: -10px 0px 10px 20px;
}
</style>
